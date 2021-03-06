var EOI_CAT = 0;
var error_CAT = 1;
var AUTOSEMICOLON_CAT = 2;
var NULL_CAT = 3;
var TRUE_CAT = 4;
var FALSE_CAT = 5;
var BREAK_CAT = 6;
var CASE_CAT = 7;
var DEFAULT_CAT = 8;
var FOR_CAT = 9;
var NEW_CAT = 10;
var VAR_CAT = 11;
var CONST_CAT = 12;
var CONTINUE_CAT = 13;
var FUNCTION_CAT = 14;
var RETURN_CAT = 15;
var VOID_CAT = 16;
var DELETE_CAT = 17;
var IF_CAT = 18;
var THIS_CAT = 19;
var DO_CAT = 20;
var WHILE_CAT = 21;
var IN_CAT = 22;
var INSTANCEOF_CAT = 23;
var TYPEOF_CAT = 24;
var SWITCH_CAT = 25;
var WITH_CAT = 26;
var RESERVED_CAT = 27;
var THROW_CAT = 28;
var TRY_CAT = 29;
var CATCH_CAT = 30;
var FINALLY_CAT = 31;
var DEBUGGER_CAT = 32;
var EQEQ_CAT = 33;
var NE_CAT = 34;
var STREQ_CAT = 35;
var STRNEQ_CAT = 36;
var LE_CAT = 37;
var GE_CAT = 38;
var OR_CAT = 39;
var AND_CAT = 40;
var PLUSPLUS_CAT = 41;
var MINUSMINUS_CAT = 42;
var LSHIFT_CAT = 43;
var RSHIFT_CAT = 44;
var URSHIFT_CAT = 45;
var PLUSEQUAL_CAT = 46;
var MINUSEQUAL_CAT = 47;
var MULTEQUAL_CAT = 48;
var DIVEQUAL_CAT = 49;
var LSHIFTEQUAL_CAT = 50;
var RSHIFTEQUAL_CAT = 51;
var URSHIFTEQUAL_CAT = 52;
var BITANDEQUAL_CAT = 53;
var MODEQUAL_CAT = 54;
var BITXOREQUAL_CAT = 55;
var BITOREQUAL_CAT = 56;
var LBRACE_CAT = 57;
var RBRACE_CAT = 58;
var NUMBER_CAT = 59;
var IDENT_CAT = 60;
var STRING_CAT = 61;
var AUTOPLUSPLUS_CAT = 62;
var AUTOMINUSMINUS_CAT = 63;
var CLASS_CAT = 64;
var ENUM_CAT = 65;
var EXPORT_CAT = 66;
var EXTENDS_CAT = 67;
var IMPORT_CAT = 68;
var SUPER_CAT = 69;
var IMPLEMENTS_CAT = 70;
var INTERFACE_CAT = 71;
var LET_CAT = 72;
var PACKAGE_CAT = 73;
var PRIVATE_CAT = 74;
var PROTECTED_CAT = 75;
var PUBLIC_CAT = 76;
var STATIC_CAT = 77;
var YIELD_CAT = 78;
var PLUS_CAT = 79;
var LPAREN_CAT = 80;
var EQUAL_CAT = 81;
var LT_CAT = 82;
var COLON_CAT = 83;
var BITOR_CAT = 84;
var EXCL_CAT = 85;
var LBRACK_CAT = 86;
var RBRACK_CAT = 87;
var DIV_CAT = 88;
var MINUS_CAT = 89;
var COMMA_CAT = 90;
var MULT_CAT = 91;
var RPAREN_CAT = 92;
var GT_CAT = 93;
var BITAND_CAT = 94;
var BITNOT_CAT = 95;
var QUESTION_CAT = 96;
var SEMICOLON_CAT = 97;
var BITXOR_CAT = 98;
var MOD_CAT = 99;
var PERIOD_CAT = 100;
var ELSE_CAT = 101;
var IF_WITHOUT_ELSE_CAT = 102;

var HASH_MOD = 147;
var HASH_MULT = 17;

var keyword_hashtable =
[
 { id: "const", cat: CONST_CAT }
,{ id: "continue", cat: CONTINUE_CAT }
,null
,null
,null
,null
,null
,null
,null
,{ id: "try", cat: TRY_CAT }
,null
,null
,null
,null
,{ id: "finally", cat: FINALLY_CAT }
,null
,null
,null
,null
,{ id: "enum", cat: ENUM_CAT }
,null
,{ id: "for", cat: FOR_CAT }
,null
,null
,{ id: "debugger", cat: DEBUGGER_CAT }
,{ id: "class", cat: CLASS_CAT }
,null
,{ id: "public", cat: PUBLIC_CAT }
,null
,null
,null
,null
,{ id: "switch", cat: SWITCH_CAT }
,null
,null
,null
,null
,null
,{ id: "break", cat: BREAK_CAT }
,{ id: "true", cat: TRUE_CAT }
,null
,null
,{ id: "typeof", cat: TYPEOF_CAT }
,null
,null
,null
,{ id: "this", cat: THIS_CAT }
,{ id: "do", cat: DO_CAT }
,null
,null
,null
,null
,null
,{ id: "throw", cat: THROW_CAT }
,null
,null
,null
,null
,null
,null
,null
,null
,null
,null
,{ id: "implements", cat: IMPLEMENTS_CAT }
,{ id: "case", cat: CASE_CAT }
,null
,null
,null
,{ id: "package", cat: PACKAGE_CAT }
,null
,null
,null
,null
,null
,{ id: "delete", cat: DELETE_CAT }
,null
,null
,{ id: "default", cat: DEFAULT_CAT }
,null
,{ id: "import", cat: IMPORT_CAT }
,{ id: "super", cat: SUPER_CAT }
,null
,{ id: "protected", cat: PROTECTED_CAT }
,{ id: "false", cat: FALSE_CAT }
,null
,null
,null
,{ id: "yield", cat: YIELD_CAT }
,null
,null
,null
,null
,null
,{ id: "null", cat: NULL_CAT }
,{ id: "return", cat: RETURN_CAT }
,null
,null
,null
,null
,null
,null
,null
,null
,{ id: "while", cat: WHILE_CAT }
,null
,null
,null
,null
,{ id: "with", cat: WITH_CAT }
,{ id: "new", cat: NEW_CAT }
,null
,null
,null
,null
,{ id: "private", cat: PRIVATE_CAT }
,null
,{ id: "let", cat: LET_CAT }
,null
,null
,{ id: "void", cat: VOID_CAT }
,{ id: "function", cat: FUNCTION_CAT }
,null
,{ id: "if", cat: IF_CAT }
,null
,{ id: "export", cat: EXPORT_CAT }
,null
,null
,null
,null
,null
,{ id: "in", cat: IN_CAT }
,null
,{ id: "interface", cat: INTERFACE_CAT }
,{ id: "else", cat: ELSE_CAT }
,{ id: "instanceof", cat: INSTANCEOF_CAT }
,null
,null
,null
,null
,null
,{ id: "catch", cat: CATCH_CAT }
,null
,null
,{ id: "var", cat: VAR_CAT }
,{ id: "extends", cat: EXTENDS_CAT }
,{ id: "static", cat: STATIC_CAT }
];
