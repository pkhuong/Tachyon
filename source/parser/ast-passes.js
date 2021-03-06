/* _________________________________________________________________________
 *
 *             Tachyon : A Self-Hosted JavaScript Virtual Machine
 *
 *
 *  This file is part of the Tachyon JavaScript project. Tachyon is
 *  distributed at:
 *  http://github.com/Tachyon-Team/Tachyon
 *
 *
 *  Copyright (c) 2011, Universite de Montreal
 *  All rights reserved.
 *
 *  This software is licensed under the following license (Modified BSD
 *  License):
 *
 *  Redistribution and use in source and binary forms, with or without
 *  modification, are permitted provided that the following conditions are
 *  met:
 *    * Redistributions of source code must retain the above copyright
 *      notice, this list of conditions and the following disclaimer.
 *    * Redistributions in binary form must reproduce the above copyright
 *      notice, this list of conditions and the following disclaimer in the
 *      documentation and/or other materials provided with the distribution.
 *    * Neither the name of the Universite de Montreal nor the names of its
 *      contributors may be used to endorse or promote products derived
 *      from this software without specific prior written permission.
 *
 *  THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS
 *  IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED
 *  TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A
 *  PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL UNIVERSITE DE
 *  MONTREAL BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
 *  EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO,
 *  PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR
 *  PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
 *  LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 *  NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 *  SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 * _________________________________________________________________________
 */

//=============================================================================

// File: "ast-passes.js", Time-stamp: <2011-03-01 13:20:29 feeley>

// Copyright (c) 2010 by Marc Feeley, All Rights Reserved.

//=============================================================================

// Utility functions

function get_free_id(postFix, loc)
{
    return new Token(
        IDENT_CAT,
        ("$tachyon$" + (get_free_id.nextIdNum++) + "$" + postFix),
        loc
    );
}

get_free_id.nextIdNum = 0;

//=============================================================================

// Generic AST walker.

function ast_walk_statement(ast, ctx)
{
    if (ast === null)
    {
        // no transformation
        return ast;
    }
    else if (ast instanceof Program)
    {
        ast.block = ctx.walk_statement(ast.block);
        return ast;
    }
    else if (ast instanceof FunctionDeclaration)
    {
        ast.funct = ctx.walk_expr(ast.funct);
        return ast;
    }
    else if (ast instanceof BlockStatement)
    {
        ast.statements = ast_walk_statements(ast.statements, ctx);
        return ast;
    }
    else if (ast instanceof VariableStatement)
    {
        ast.decls.forEach(function (decl, i, self)
                          {
                              decl.initializer = ctx.walk_expr(decl.initializer);
                          });
        return ast;
    }
    else if (ast instanceof ConstStatement)
    {
        // TODO
        error("ConstStatement not implemented");
        return ast;
    }
    else if (ast instanceof ExprStatement)
    {
        ast.expr = ctx.walk_expr(ast.expr);
        return ast;
    }
    else if (ast instanceof IfStatement)
    {
        ast.expr = ctx.walk_expr(ast.expr);
        ast.statements = ast_walk_statements(ast.statements, ctx);
        return ast;
    }
    else if (ast instanceof DoWhileStatement)
    {
        ast.statement = ctx.walk_statement(ast.statement);
        ast.expr = ctx.walk_expr(ast.expr);
        return ast;
    }
    else if (ast instanceof WhileStatement)
    {
        ast.expr = ctx.walk_expr(ast.expr);
        ast.statement = ctx.walk_statement(ast.statement);
        return ast;
    }
    else if (ast instanceof ForStatement)
    {
        ast.expr1 = ctx.walk_expr(ast.expr1);
        ast.expr2 = ctx.walk_expr(ast.expr2);
        ast.expr3 = ctx.walk_expr(ast.expr3);
        ast.statement = ctx.walk_statement(ast.statement);
        return ast;
    }
    else if (ast instanceof ForVarStatement)
    {
        for (var i=ast.decls.length-1; i>=0; i--)
        {
            var decl = ast.decls[i];
            decl.initializer = ctx.walk_expr(decl.initializer);
        }
        ast.expr2 = ctx.walk_expr(ast.expr2);
        ast.expr3 = ctx.walk_expr(ast.expr3);
        ast.statement = ctx.walk_statement(ast.statement);
        return ast;
    }
    else if (ast instanceof ForInStatement)
    {
        ast.lhs_expr = ctx.walk_expr(ast.lhs_expr);
        ast.set_expr = ctx.walk_expr(ast.set_expr);
        ast.statement = ctx.walk_statement(ast.statement);
        return ast;
    }
    else if (ast instanceof ForVarInStatement)
    {
        ast.initializer = ctx.walk_expr(ast.initializer);
        ast.set_expr = ctx.walk_expr(ast.set_expr);
        ast.statement = ctx.walk_statement(ast.statement);
        return ast;
    }
    else if (ast instanceof ContinueStatement)
    {
        return ast;
    }
    else if (ast instanceof BreakStatement)
    {
        return ast;
    }
    else if (ast instanceof ReturnStatement)
    {
        ast.expr = ctx.walk_expr(ast.expr);
        return ast;
    }
    else if (ast instanceof WithStatement)
    {
        ast.expr = ctx.walk_expr(ast.expr);
        ast.statement = ctx.walk_statement(ast.statement);
        return ast;
    }
    else if (ast instanceof SwitchStatement)
    {
        ast.expr = ctx.walk_expr(ast.expr);
        ast.clauses.forEach(function (c, i, asts)
                            {
                                c.expr = ctx.walk_expr(c.expr);
                                c.statements = ast_walk_statements(c.statements, ctx);
                            });
        return ast;
    }
    else if (ast instanceof LabelledStatement)
    {
        ast.statement = ctx.walk_statement(ast.statement);
        return ast;
    }
    else if (ast instanceof ThrowStatement)
    {
        ast.expr = ctx.walk_expr(ast.expr);
        return ast;
    }
    else if (ast instanceof TryStatement)
    {
        ast.statement = ctx.walk_statement(ast.statement);
        ast.catch_part = ctx.walk_statement(ast.catch_part);
        ast.finally_part = ctx.walk_statement(ast.finally_part);
        return ast;
    }
    else if (ast instanceof CatchPart)
    {
        ast.statement = ctx.walk_statement(ast.statement);
        return ast;
    }
    else if (ast instanceof DebuggerStatement)
    {
        return ast;
    }
    else
    {
        //pp(ast);
        error("unknown ast in walk_statement");
    }
}

function ast_walk_statements(asts, ctx)
{
    asts.forEach(function (ast, i, asts)
                 {
                     asts[i] = ctx.walk_statement(ast);
                 });
    return asts;
}

function ast_walk_expr(ast, ctx)
{
    if (ast === null)
    {
        // no transformation
        return ast;
    }
    else if (ast instanceof OpExpr)
    {
        ast.exprs = ast_walk_exprs(ast.exprs, ctx);
        return ast;
    }
    else if (ast instanceof NewExpr)
    {
        ast.expr = ctx.walk_expr(ast.expr);
        ast.args = ast_walk_exprs(ast.args, ctx);
        return ast;
    }
    else if (ast instanceof CallExpr)
    {
        ast.fn = ctx.walk_expr(ast.fn);
        ast.args = ast_walk_exprs(ast.args, ctx);
        return ast;
    }
    else if (ast instanceof FunctionExpr)
    {
        ast.body = ast_walk_statements(ast.body, ctx);
        return ast;
    }
    else if (ast instanceof Literal)
    {
        return ast;
    }
    else if (ast instanceof ArrayLiteral)
    {
        ast.exprs = ast_walk_exprs(ast.exprs, ctx);
        return ast;
    }
    else if (ast instanceof RegExpLiteral)
    {
        return ast;
    }
    else if (ast instanceof ObjectLiteral)
    {
        ast.properties.forEach(function (prop, i, self)
                               {
                                   prop.name = ctx.walk_expr(prop.name);
                                   prop.value = ctx.walk_expr(prop.value);
                               });
        return ast;
    }
    else if (ast instanceof Ref)
    {
        return ast;
    }
    else if (ast instanceof This)
    {
        return ast;
    }
    else
    {
        //pp(ast);
        error("unknown ast in walk_expr");
    }
}

function ast_walk_exprs(asts, ctx)
{
    asts.forEach(function (ast, i, asts)
                 {
                     asts[i] = ctx.walk_expr(ast);
                 });
    return asts;
}


//-----------------------------------------------------------------------------

// Pass 1.
//
// Adds debugging traces.

function ast_pass1_ctx()
{
    this.fn_decl = null;
}


ast_pass1_ctx.prototype.walk_statement = function (ast)
{
    if (ast === null)
    {
        // no transformation
        return ast;
    }
    else if (ast instanceof Program)
    {
        var debug_lib = "                                                   \
                                                                            \
          var debug$print = print;                                          \
          var debug$nesting = 0;                                            \
                                                                            \
          function debug$nest(loc, fn, enter)                               \
          { var level = enter ? ++debug$nesting : debug$nesting--;          \
            var prefix = \"\";                                              \
            if (level > 9) { prefix = \"|[\"+level+\"] \"; level = 8; }     \
            while (level-- > 0) prefix = \"|  \" + prefix;                  \
            debug$print(prefix+(enter?\"((\":\"))\")+\" \"+loc+\": \"+fn);  \
          }                                                                 \
                                                                            \
          function debug$enter(loc, fn)                                     \
          { debug$nest(loc, fn, true); }                                    \
                                                                            \
          function debug$return0(loc, fn)                                   \
          { debug$nest(loc, fn, false); }                                   \
                                                                            \
          function debug$return1(loc, fn, result)                           \
          { debug$nest(loc, fn, false);                                     \
            return result;                                                  \
          }                                                                 \
                                                                            \
        ";

        var s = new Scanner(new String_input_port(debug_lib));
        var p = new Parser(s, false);
        var prog = p.parse();

        ast_walk_statement(ast, this);

        ast.block.statements = prog.block.statements.concat(ast.block.statements);
        return ast;
    }
    else if (ast instanceof FunctionDeclaration)
    {
        var save_fn_decl = this.fn_decl;
        this.fn_decl = ast;
        ast.funct = this.walk_expr(ast.funct);
        this.fn_decl = save_fn_decl;
        return ast;
    }
    else if (ast instanceof ReturnStatement)
    {
        ast.expr = this.walk_expr(ast.expr);
        if (!this.filter_debug(ast))
        {
            return ast;
        }
        else if (ast.expr !== null)
        {
            ast.expr = this.call_debug("debug$return1", ast.loc, ast.expr);
            return ast;
        }
        else
        {
            return new BlockStatement(ast.loc,
                                      [new ExprStatement(ast.loc,
                                                        this.call_debug("debug$return0", ast.loc)),
                                       ast]);
        }
    }
    else
    {
        return ast_walk_statement(ast, this);
    }
};

ast_pass1_ctx.prototype.walk_expr = function (ast)
{
    if (ast === null)
    {
        // no transformation
        return ast;
    }
    else if (ast instanceof FunctionExpr)
    {
        ast_walk_statements(ast.body, this);

        if (this.filter_debug(ast))
        {
            ast.body.unshift(new ExprStatement(ast.loc,
                                               this.call_debug("debug$enter",
                                                               ast.loc)));
            ast.body.push(new ExprStatement(ast.loc,
                                            this.call_debug("debug$return0", ast.loc)));
        }

        return ast;
    }
    else
    {
        return ast_walk_expr(ast, this);
    }
};

ast_pass1_ctx.prototype.call_debug = function (fn, loc, result)
{
    var args = [new Literal(loc,
                            loc.to_string()),
                new Literal(loc,
                            (this.fn_decl !== null)
                            ? this.fn_decl.id.toString()
                            : "?")];

    if (result !== undefined)
        args.push(result);
                    
    return new CallExpr(loc,
                        new Ref(loc,
                                new Token(IDENT_CAT, fn, loc)),
                        args);
}

ast_pass1_ctx.prototype.filter_debug = function (ast)
{
    // TODO: This filtering should be user configurable from a command line option.
    if (ast.loc.filename === "parser/parser.js" ||
        ast.loc.filename === "parser/scanner.js" ||
//        ast.loc.filename === "utility/debug.js" ||
        (this.fn_decl !== null &&
         this.fn_decl.id.toString() === "assert"))
        return false;
    return true;
}

function ast_pass1(ast)
{
    var ctx = new ast_pass1_ctx();
    ctx.walk_statement(ast);
}

//-----------------------------------------------------------------------------

// Pass 2.
//
// Identifies functions that use the "eval" and "arguments" symbols.
//
// NOTE: this is not done through free variables for two reasons:
// 1. Free variables can come from nested sub-functions.
// 2. Free variable resolution and must be done after pass 2

function ast_pass2_ctx(ast)
{
    this.ast = ast;
}

ast_pass2_ctx.prototype.walk_statement = function (ast)
{
    if (ast === null)
    {
        // no transformation
        return ast;
    }
    else
    {
        return ast_walk_statement(ast, this);
    }
};

ast_pass2_ctx.prototype.walk_expr = function (ast)
{
    if (ast === null)
    {
        // no transformation
        return ast;
    }

    // Function expression
    else if (ast instanceof FunctionExpr)
    {
        // Create a new context to traverse the function body
        var new_ctx = new ast_pass2_ctx(ast);

        // Traverse the function body
        ast_walk_statements(ast.body, new_ctx);

        // Return the updated function
        return ast;
    }

    // Variable reference
    else if (ast instanceof Ref)
    {
        // TODO: eliminate when ids are fixed
        var symName = ast.id.toString();

        if (symName === "arguments")
            this.ast.usesArguments = true;

        else if (symName === "eval")
            this.ast.usesEval = true;

        return ast;
    }

    else
    {
        return ast_walk_expr(ast, this);
    }
};

function ast_pass2(ast)
{
    var ctx = new ast_pass2_ctx(ast);
    ctx.walk_statement(ast);
}

//-----------------------------------------------------------------------------

// Pass 3.
//
// Transforms an AST into which, when the arguments name occurs free, references
// to formal parameters become references to an alias of the arguments object

function ast_pass3_ctx(varMap)
{
    // Map function parameters names/ids to pairs argObj/index or nothing
    this.varMap = varMap;
}

ast_pass3_ctx.prototype.walk_statement = function (ast)
{
    if (ast === null)
    {
        // no transformation
        return ast;
    }
    else
    {
        return ast_walk_statement(ast, this);
    }
};

ast_pass3_ctx.prototype.walk_expr = function (ast)
{
    if (ast === null)
    {
        // no transformation
        return ast;
    }

    // Function expression
    else if (ast instanceof FunctionExpr)
    {
        // Create a copy of the
        var newVarMap = this.varMap.copy();

        // If the arguments object may be used
        if (ast.usesArguments)
        {
            // Get a free id for the arguments object alias
            var argsObjId = get_free_id("argsObj", ast.loc);

            // Create the arguments object alias in the function body
            ast.body.unshift(
                new VariableStatement(
                    ast.loc,
                    [
                        new Decl(
                            ast.loc,
                            argsObjId,
                            new Ref(ast.loc,
                                    new Token(IDENT_CAT, "arguments", ast.loc))
                        )
                    ]
                )
            );

            // For each function parameter
            for (var i = 0; i < ast.params.length; ++i)
            {
                var symName = ast.params[i].toString();

                newVarMap.addItem(symName, { id:argsObjId, index:i });
            }
        }
        else
        {
            // The parameters of the function are not associated
            for (var i = 0; i < ast.params.length; ++i)
            {
                var symName = ast.params[i].toString();
                if (newVarMap.hasItem(symName))
                    newVarMap.remItrm(symName);
            }
        }

        // Create a new context to traverse the function body
        var new_ctx = new ast_pass3_ctx(newVarMap);

        // Traverse and update the function body
        ast.body = ast_walk_statements(ast.body, new_ctx);

        // Return the updated function
        return ast;
    }

    // Variable reference
    else if (ast instanceof Ref)
    {
        // TODO: eliminate when ids are fixed
        var symName = ast.id.toString();

        // If there is an association for this symbol
        if (this.varMap.hasItem(symName))
        {
            // Get the association
            var assoc = this.varMap.getItem(symName);

            // Replace the parameter reference by an argument object indexing
            return new OpExpr(
                ast.loc,
                "x [ y ]",
                [
                    new Ref(ast.loc, assoc.id),
                    new Literal(ast.loc, assoc.index)
                ]
            );
        }
        else
        {
            return ast;
        }
    }

    else
    {
        return ast_walk_expr(ast, this);
    }
};

function ast_pass3(ast)
{
    var ctx = new ast_pass3_ctx(new HashMap());
    ctx.walk_statement(ast);
}

//-----------------------------------------------------------------------------

// Pass 4.
//
// Transforms an AST into a simpler AST.
//
//   - transform "VariableStatement" into assignment
//   - transform "ForVarStatement" into "ForStatement"
//   - transform "ForVarInStatement" into "ForInStatement"
//   - flattening of nested block statements

function ast_pass4_ctx(vars, scope)
{
    this.vars = vars;
    this.scope = scope;
}

function ast_pass4_empty_ctx(scope)
{
    return new ast_pass4_ctx({}, scope);
}

function ast_Variable(id, is_param, scope)
{
    this.id       = id;
    this.is_param = is_param;
    this.scope    = scope;
}

ast_Variable.prototype.toString = function ()
{
    return this.id.toString();
};

ast_pass4_ctx.prototype.function_ctx = function (ast)
{
    var new_ctx = ast_pass4_empty_ctx(ast);
    ast.params.forEach(function (param, i, self)
                       {
                           new_ctx.add_variable(param, true);
                       });
    return new_ctx;
};

ast_pass4_ctx.prototype.catch_ctx = function (ast)
{
    var new_ctx = ast_pass4_empty_ctx(ast);
    new_ctx.add_variable(ast.id, true);
/*
    [new Decl(IDENT.loc.join(Initializer.loc),
                     IDENT,
                     Initializer)]
*/
    return new_ctx;
};

ast_pass4_ctx.prototype.add_variable = function (id, is_param)
{
    var id_str = id.value;
    var v = this.vars[id_str];
    if (typeof v === "undefined")
    {
        v = new ast_Variable(id, is_param, this.scope);
        this.vars[id_str] = v;
    }
    return v;
};

ast_pass4_ctx.prototype.walk_statement = function (ast)
{
    if (ast === null)
    {
        // no transformation
        return ast;
    }
    else if (ast instanceof Program)
    {
        var new_ctx = ast_pass4_empty_ctx(ast);
        ast.block = new_ctx.walk_statement(ast.block);
        ast.vars = new_ctx.vars;
        return ast;
    }
    else if (ast instanceof FunctionDeclaration)
    {
        this.add_variable(ast.id, false);
        ast.funct = this.walk_expr(ast.funct);
        return ast;
    }
    else if (ast instanceof VariableStatement)
    {
        var ctx = this;
        var accum = [];
        ast.decls.forEach(function (decl, i, self)
                          {
                              ctx.add_variable(decl.id, false);
                              if (decl.initializer !== null)
                              {
                                  decl.initializer = ctx.walk_expr(decl.initializer);
                                  accum.push(new ExprStatement(
                                               decl.loc,
                                               new OpExpr(decl.loc,
                                                          op2_table[EQUAL_CAT],
                                                          [new Ref(decl.id.loc,
                                                                   decl.id),
                                                           decl.initializer])));
                              }
                          });
        if (accum.length === 1)
            return accum[0];
        else
            return new BlockStatement(ast.loc,
                                      accum);
    }
    else if (ast instanceof ForVarStatement)
    {
        var accum = null;
        for (var i=ast.decls.length-1; i>=0; i--)
        {
            var decl = ast.decls[i];
            this.add_variable(decl.id, false);
            if (decl.initializer !== null)
            {
                decl.initializer = this.walk_expr(decl.initializer);
                var init = new OpExpr(decl.loc,
                                      op2_table[EQUAL_CAT],
                                      [new Ref(decl.id.loc,
                                               decl.id),
                                       decl.initializer]);
                if (accum === null)
                    accum = init;
                else
                    accum = new OpExpr(decl.loc,
                                       op2_table[COMMA_CAT],
                                       [init, accum]);
            }
        }
        ast.expr2 = this.walk_expr(ast.expr2);
        ast.expr3 = this.walk_expr(ast.expr3);
        ast.statement = this.walk_statement(ast.statement);
        return new ForStatement(ast.loc,
                                accum,
                                ast.expr2,
                                ast.expr3,
                                ast.statement);
    }
    else if (ast instanceof ForVarInStatement)
    {
        this.add_variable(ast.id, false);
        var initializer = this.walk_expr(ast.initializer);
        var set_expr = this.walk_expr(ast.set_expr);
        var statement = this.walk_statement(ast.statement);
        var for_stat = new ForInStatement(ast.loc,
                                          new Ref(ast.id.loc,
                                                  ast.id),
                                          set_expr,
                                          statement);
        if (initializer === null)
            return for_stat;
        else
            return new BlockStatement(ast.loc,
                                      [new ExprStatement(
                                         initializer.loc,
                                         new OpExpr(ast.loc,
                                                    op2_table[EQUAL_CAT],
                                                    [new Ref(ast.id.loc,
                                                             ast.id),
                                                     initializer])),
                                       for_stat]);
    }
    else if (ast instanceof CatchPart)
    {
        var new_ctx = this.catch_ctx(ast);
        ast.statement = new_ctx.walk_statement(ast.statement);
        ast.vars = new_ctx.vars;
        ast.parent = this.scope;
        return ast;
    }
    else
        return ast_walk_statement(ast, this);
};

ast_pass4_ctx.prototype.walk_expr = function (ast)
{
    if (ast === null)
    {
        // no transformation
        return ast;
    }
    else if (ast instanceof FunctionExpr)
    {
        var new_ctx = this.function_ctx(ast);
        if (ast.id !== null)
            new_ctx.add_variable(ast.id, false);
        ast.body = new_ctx.walk_statements(ast.body);
        ast.vars = new_ctx.vars;
        ast.parent = this.scope;
        return ast;
    }
    else
    {
        return ast_walk_expr(ast, this);
    }
};

ast_pass4_ctx.prototype.walk_statements = function (asts)
{
    var ctx = this;
    var accum = [];
    asts.forEach(function (ast, i, asts)
                 {
                     var a = ctx.walk_statement(ast);
                     if (a instanceof BlockStatement)
                         accum.push(a.statements); // merge embedded blocks
                     else
                         accum.push([a]);
                 });
    return Array.prototype.concat.apply([], accum);
};

function ast_pass4(ast)
{
    var ctx = ast_pass4_empty_ctx(null);
    ctx.walk_statement(ast);
}

//-----------------------------------------------------------------------------

// Pass 5.
//
// Transforms an AST into an AST in which
//
//   - variables are resolved according to their scope
//   - a map of escaping variables is added to functions
//   - a map of closure-provided variables is added to functions
//   - a list of all nested functions is added to functions

function ast_pass5_ctx(scope)
{
    this.scope = scope;
}

ast_pass5_ctx.prototype.function_ctx = function (ast)
{
    var new_ctx = new ast_pass5_ctx(ast);

    ast.params.forEach(
        function (param, i, self)
        {
            param[i] = new_ctx.resolve_variable(param);
        }
    );

    return new_ctx;
};

ast_pass5_ctx.prototype.catch_ctx = function (ast)
{
    var new_ctx = new ast_pass5_ctx(ast);

    ast.id = new_ctx.resolve_variable(ast.id);

    return new_ctx;
};

ast_pass5_ctx.prototype.resolve_variable = function (id)
{
    // Where is this id declared???

    function resolve(scope)
    {
        var id_str = id.value;

        // If the id is declared in the current scope
        var v = scope.vars[id_str];
        if (typeof v !== "undefined")
            return v;

        // If the id is a free variable of the current scope
        v = scope.free_vars[id_str];
        if (typeof v !== "undefined")
            return v;

        // If the current scope is global
        if (scope instanceof Program)
            v = new ast_Variable(id, false, scope);
        else
            v = resolve(scope.parent);

        if (!(scope instanceof CatchPart))
        {
            // This variable is declared in an enclosing scope, add it to the free variable list of the current scope
            scope.free_vars[id_str] = v;

            // If this is not a global variable, add it to the closure variable list of the current scope
            // TODO: the computation of clos_vars should be done elsewhere as it is not related to the semantics
            if (!(v.scope instanceof Program))
                scope.clos_vars[id_str] = v;
        }

        // If the variable's scope is a function and does not match the current scope, mark
        // the variable as escaping in its scope of origin
        if (v.scope instanceof FunctionExpr && v.scope !== scope)
            v.scope.esc_vars[id_str] = v;

        return v;
    }

    return resolve(this.scope);
};

ast_pass5_ctx.prototype.walk_statement = function (ast)
{
    if (ast === null)
    {
        // no transformation
        return ast;
    }
    else if (ast instanceof Program)
    {
        ast.free_vars = {};
        ast.funcs = [];

        var new_ctx = new ast_pass5_ctx(ast);
        ast.block = new_ctx.walk_statement(ast.block);
        return ast;
    }
    else if (ast instanceof FunctionDeclaration)
    {
        // Set the current function declaration
        this.func_decl = ast;

        ast.id = this.resolve_variable(ast.id);
        ast.funct = this.walk_expr(ast.funct);

        return ast;
    }
    else if (ast instanceof CatchPart)
    {
        ast.free_vars = {};

        // TODO
        //var new_ctx = this.catch_ctx(ast);
        var new_ctx = this;

        ast.statement = new_ctx.walk_statement(ast.statement);
        return ast;
    }
    else
    {
        return ast_walk_statement(ast, this);
    }
};

ast_pass5_ctx.prototype.walk_expr = function (ast)
{
    if (ast === null)
    {
        // no transformation
        return ast;
    }
    else if (ast instanceof FunctionExpr)
    {
        ast.free_vars = {};
        ast.clos_vars = {};
        ast.esc_vars = {};
        ast.funcs = [];

        // Add this function to the scope's nested function list
        // If this function is part of a function declaration, add the declaration instead
        // TODO: fix this code which does not work when the scope is for a CatchPart
        if (this.func_decl !== undefined && this.func_decl.funct === ast)
            this.scope.funcs.push(this.func_decl);
        else
            this.scope.funcs.push(ast);

        var new_ctx = this.function_ctx(ast);

        if (ast.id !== null)
            ast.id = new_ctx.resolve_variable(ast.id);

        ast.body = ast_walk_statements(ast.body, new_ctx);

        return ast;
    }
    else if (ast instanceof Ref)
    {
        ast.id = this.resolve_variable(ast.id);
        return ast;
    }
    else
    {
        return ast_walk_expr(ast, this);
    }
};

function ast_pass5(ast)
{
    var ctx = new ast_pass5_ctx(ast);
    ctx.walk_statement(ast);
}

//-----------------------------------------------------------------------------

function ast_normalize(ast, debug)
{
    if (debug)
        ast_pass1(ast);
    ast_pass2(ast);
    ast_pass3(ast);
    ast_pass4(ast);
    ast_pass5(ast);

    return ast;
}

//=============================================================================
