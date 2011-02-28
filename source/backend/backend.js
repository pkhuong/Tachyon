/**
@fileOverview
Entry point for the backend of the Javascript VM. This code should be platform agnostic.

@copyright
Copyright (c) 2010 Tachyon Javascript Engine, All Rights Reserved
*/

/** @namespace */
var backend = {};

/**
    Returns a code block representing the compiled IRFunction.
*/
backend.compileIRToCB = function (ir, params)
{
    var print = params.print;
    var primitives = params.primitives;

    if (print === undefined)
    {
        print = function () {};
    }

    const mem = x86.Assembler.prototype.memory;
    const reg = x86.Assembler.prototype.register;
    const translator = irToAsm.translator(params);

    var cfg, order, liveIntervals, mems;
    var i, k, next, tab;
    var fixedIntervals;
    var fcts = ir.getChildrenList();
    var startIndex = 0;

    if (primitives !== undefined)
    {
        fcts = primitives.concat(fcts);
    }

    //translator.asm.codeBlock.assemble();
    //print("******* Definitions *********************");
    //print(translator.asm.codeBlock.listingString(startIndex));
    //startIndex = translator.asm.codeBlock.code.length;
    //print("*****************************************");

    // For each function, order blocks, allocate registers, translate to 
    // assembly and generate code 

    for (k=0; k<fcts.length; ++k)
    {
        if (params.printRegAlloc === true)
            print("Translation of function: '" + fcts[k].funcName + "'");

        // Add register allocation information on the function
        fcts[k].regAlloc = fcts[k].regAlloc || {};
        fcts[k].regAlloc.spillNb = 0;

        cfg = fcts[k].virginCFG.copy();

        //print("Order blocks");
        order = allocator.orderBlocks(cfg);
        allocator.numberInstrs(cfg, order, params);

        if (params.printRegAlloc === true)
            print("******* Before register allocation ******");

        var block;
        var tab = "\t";
        var instr;

        function lnPfxFormatFn(obj)
        {
            if (obj instanceof BasicBlock)
            {
                if (obj.regAlloc.from === -1)
                {
                    return "   ";
                } else
                {
                    return obj.regAlloc.from + ": ";
                }
            } else if (obj instanceof IRInstr)
            {
                if (obj.regAlloc.id === undefined)
                {
                    return "    \t";
                } else
                {
                    return obj.regAlloc.id + ": \t";
                }
            } else
            {
                return "";
            }   
        }

        if (params.printRegAlloc === true)
            print(cfg.toString(function () { return order; }, undefined, undefined, 
                           lnPfxFormatFn));

        //print("Computing live intervals");
        liveIntervals = allocator.liveIntervals(cfg, order, params);
        //print("Computing fixed intervals");
        fixedIntervals = allocator.fixedIntervals(order, params);

        // Print intervals before allocation
        /*
        for (i=0; i<liveIntervals.length; ++i)
        {
            print(i + ": " + liveIntervals[i] + ",");
        }
        print();
        */

        mems = irToAsm.spillAllocator(params);

        //print("Linear Scan");
        allocator.linearScan(params, 
                             liveIntervals, 
                             mems, 
                             fixedIntervals);

        //print("Assign");
        // Add physical registers and memory location to operands
        // of every instruction
        allocator.assign(cfg, params); 
    
        //print("Resolve");
        // SSA form deconstruction and linear scan resolution 
        order = allocator.resolve(cfg, liveIntervals, order, params);

        if (params.printRegAlloc === true)
        {
            print("******* After register allocation *******");

            function inFormatFn(instr, pos)
            {
                opnd = instr.regAlloc.opnds[pos];
                if (opnd instanceof IRValue)
                {
                    return opnd.getValName();
                } else
                {
                    return String(opnd);
                }
            }

            function outFormatFn(instr)
            {
                return String(instr.regAlloc.dest);
            }

            print(cfg.toString(function () { return order; }, outFormatFn, inFormatFn,
                               lnPfxFormatFn));
        }

        fcts[k].regAlloc.spillNb = mems.slots.length;

        // Translate from IR to ASM
        translator.genFunc(fcts[k], order);

        //translator.asm.codeBlock.assemble();
        //print("******* Listing *************************");
        //print(translator.asm.codeBlock.listingString(startIndex));
        //startIndex = translator.asm.codeBlock.code.length;

        /*
        assert(
            allocator.validate(cfg, params),
            'validation failed'
        );
        */
        /*
        print("******* Mapping validation **************");

        cfg.getBlockItr().forEach(function (block)
        {
            print(block.getBlockName() + " expecting:");
            print(block.regAlloc.expected);
            print();
        });
        */
        
        if (params.printRegAlloc === true)
        {
            print("*****************************************");
            print("Number of spills: " + fcts[k].regAlloc.spillNb);
            print();
        }
    }
    
    //print("Assemble");
    // Add the initialization code at the beginning
    // and reassemble
    translator.asm.codeBlock.assemble();

    for (k=0; k<fcts.length; ++k)
    {
        allocator.clean(fcts[k]);
        //fcts[k].virginCFG = null;
        fcts[k].finalCFG = null;
    }

    //print("done");

    return translator.asm.codeBlock;
};

/** 
    Compile an IRFunction to a machine code block.
    This machine code block should be freed once it is no longer needed.
    Returns the machine code block.
*/
backend.compileIRToMCB = function (ir, params)
{
    var cb = backend.compileIRToCB(ir, params);
    
    if (params.printASM === true)
        params.print(backend.listing(cb));

    return cb.assembleToMachineCodeBlock(); // assemble it
};

/**
    Returns a string representation of the listing for the given
    code block.
*/
backend.listing = function (codeBlock)
{
    return codeBlock.listingString();
};

/**
    Allocate an executable memory zone, write the given code block in
    that zone, execute it, free the memory zone and return the result.
*/
backend.executeCB = function (codeBlock)
{
    // TODO: add support for list of arguments to function

    // TODO: move assemble and free outside of here, do not want to do this
    // at every execution

    var block = codeBlock.assembleToMachineCodeBlock(); // assemble it
    var x = execMachineCodeBlock(block); // execute the code generated
    freeMachineCodeBlock(block);
    return x;
};

backend.primitiveList = [];
