'use strict';

var _babelPluginMacros = require('babel-plugin-macros');

var _babelLiteralToAst = require('babel-literal-to-ast');

var _babelLiteralToAst2 = _interopRequireDefault(_babelLiteralToAst);

var _graphqlTag = require('graphql-tag');

var _graphqlTag2 = _interopRequireDefault(_graphqlTag);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

module.exports = (0, _babelPluginMacros.createMacro)(graphqlTagMacro);

function graphqlTagMacro(_ref) {
  var references = _ref.references,
      babel = _ref.babel;

  references.default.forEach(function (path) {
    if (path.parentPath.type === 'TaggedTemplateExpression') {
      compile(babel, path.parentPath);
    }
  });
}

function compile(babel, path) {
  var t = babel.types;
  var source = path.node.quasi.quasis.map(function (node) {
    return node.value.raw;
  }).join('');
  var expressions = path.get('quasi').get('expressions');

  expressions.forEach(function (expr) {
    if (!t.isIdentifier(expr) && !t.isMemberExpression(expr)) {
      throw expr.buildCodeFrameError('Only identifiers or member expressions are allowed by this macro as an interpolation in a graphql template literal.');
    }
  });

  var compiled = (0, _babelLiteralToAst2.default)((0, _graphqlTag2.default)(source));

  if (expressions.length) {
    var definitionsProperty = compiled.properties.find(function (p) {
      return p.key.value === 'definitions';
    });
    var definitionsArray = definitionsProperty.value;

    var extraDefinitions = expressions.map(function (expr) {
      return t.memberExpression(expr.node, t.identifier('definitions'));
    });

    definitionsProperty.value = t.callExpression(t.memberExpression(definitionsArray, t.identifier('concat')), extraDefinitions);
  }

  path.replaceWith(compiled);
}