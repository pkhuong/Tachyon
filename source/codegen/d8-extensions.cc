/*===========================================================================*/

/* File: "d8-extensions.cc", Time-stamp: <2010-06-18 13:35:20 feeley> */

/* Copyright (c) 2010 by Marc Feeley, All Rights Reserved. */

/*===========================================================================*/

/*
 * This file contains the extensions to the D8 executable.  It implements
 * some auxiliary functions for the Tachyon compiler:
 *
 * - writeFile("filename", "text")  save text to the file
 * - allocMachineCodeBlock(n)       allocate a machine code block of length n
 * - freeMachineCodeBlock(block)    free a machine code block
 * - execMachineCodeBlock(block)    execute a machine code block
 *
 * Note: a MachineCodeBlock is an array of bytes which can be accessed
 * like other JS arrays, in particular you can assign to it.  For example:
 *
 *    var block = allocMachineCodeBlock(2);
 *    block[0] = 0x90;  // x86 "nop"
 *    block[1] = 0xc3;  // x86 "ret"
 *    execMachineCodeBlock(block);
 */

/*
 * To extend D8, the file src/d8.cc must me modified, followed by a
 *
 *   % scons d8
 *
 * There are two modifications; just before and inside of the definition of
 * the method Shell::Initialize().  The code should be modified like this:
 *
 *  #include "d8-extensions.cc"      // <====== ADDED!
 *
 *  void Shell::Initialize() {
 *  ...
 *
 *  global_template->Set(String::New("load"), FunctionTemplate::New(Load));
 *  global_template->Set(String::New("quit"), FunctionTemplate::New(Quit));
 *  global_template->Set(String::New("version"), FunctionTemplate::New(Version));
 *
 *  INIT_D8_EXTENSIONS;              // <====== ADDED!
 *  ...
 *  }
 */

/*---------------------------------------------------------------------------*/


v8::Handle<v8::Value> WriteFile(const v8::Arguments& args)
{
  if (args.Length() != 2)
    {
      printf("Error in WriteFile -- 2 arguments expected\n");
      exit(1);
    }
  else
    {
      v8::String::Utf8Value filename_str(args[0]);
      const char* filename = *filename_str;
      v8::String::Utf8Value content_str(args[1]);
      const char* content = *content_str;

      FILE *out = fopen(filename, "w");
      if (out == NULL)
        {
          printf("Error in WriteFile -- can't open file\n");
          exit(1);
        }
      else
        {
          fprintf(out, "%s", content);
          fclose(out);
        }
    }

  return v8::Undefined();
}


/*---------------------------------------------------------------------------*/


/* OS dependent settings for dynamic code generation */


#ifdef linux
#define USE_MMAP_FOR_CODE
#endif


#ifdef __APPLE__
/* just use malloc */
#endif


/*---------------------------------------------------------------------------*/


#include <stdio.h>
#include <stdlib.h>
#include <string.h>


/* typedef unsigned char uint8_t; */

typedef int word; // must correspond to natural word width of CPU

typedef word (*c_handler)();

typedef struct
{
  word stack_limit; // stack allocation limit, also used for polling interrupts
  word heap_limit;  // heap allocation limit
  c_handler handlers[3];  // C functions called by the code generated by the compiler
} runtime_context;

typedef word (*mach_code_ptr)(runtime_context*);

typedef union
{
  mach_code_ptr fn_ptr;
  uint8_t* data_ptr;
} data_to_fn_ptr_caster;


#define CAST(type,val) ((type)(val))


#ifdef USE_MMAP_FOR_CODE
#define NEED_sys_mman_h
#else
#ifdef USE_MPROTECT_FOR_CODE
#define NEED_sys_mman_h
#endif
#endif


#ifdef NEED_sys_mman_h
#include <sys/mman.h>
#endif


uint8_t *alloc_machine_code_block(int size)
{
  void *p;

#ifdef USE_MMAP_FOR_CODE

  p = mmap(0,
           size,
           PROT_READ | PROT_WRITE | PROT_EXEC,
           MAP_PRIVATE | MAP_ANON,
           -1,
           0);

#else

  p = malloc(size);

#endif

#ifdef USE_MPROTECT_FOR_CODE

  mprotect(p, size, PROT_READ|PROT_WRITE|PROT_EXEC);

#endif

  return CAST(uint8_t*, p);
}


void free_machine_code_block(uint8_t *code, int size)
{
#ifdef USE_MMAP_FOR_CODE

  munmap(code, size);

#else

  free(code);

#endif
}


/*---------------------------------------------------------------------------*/


/* A test for x86 */


/* various handlers that the generated code can call */

word handler0(void)           { printf("hello world!\n"); return 11; }
word handler1(word x)         { printf("x = %d\n", x);    return 22; }
word handler2(word x, word y) { return x+y; }


v8::Handle<v8::Value> AllocMachineCodeBlock(const v8::Arguments& args)
{
  if (args.Length() != 1)
    {
      printf("Error in AllocMachineCodeBlock -- 1 argument expected\n");
      exit(1);
    }
  else
    {
      int len = args[0]->Int32Value();
      uint8_t* block = static_cast<uint8_t*>(alloc_machine_code_block(len));
      v8::Handle<v8::Object> obj = v8::Object::New();
      i::Handle<i::JSObject> jsobj = v8::Utils::OpenHandle(*obj);

      /* Set the elements to be the external array. */
      obj->SetIndexedPropertiesToExternalArrayData(block,
                                                   v8::kExternalUnsignedByteArray,
                                                   len);

      return obj;
    }
}


v8::Handle<v8::Value> FreeMachineCodeBlock(const v8::Arguments& args)
{
  if (args.Length() != 1)
    {
      printf("Error in FreeMachineCodeBlock -- 1 argument expected\n");
      exit(1);
    }
  else
    {
      i::Handle<i::JSObject> jsobj = v8::Utils::OpenHandle(*args[0]);
      Handle<v8::internal::ExternalUnsignedByteArray> array(v8::internal::ExternalUnsignedByteArray::cast(jsobj->elements()));
      uint32_t len = static_cast<uint32_t>(array->length());
      uint8_t* block = static_cast<uint8_t*>(array->external_pointer());

      free_machine_code_block(block, len);

      return Undefined();
    }
}


v8::Handle<v8::Value> ExecMachineCodeBlock(const v8::Arguments& args)
{
  if (args.Length() != 1)
    {
      printf("Error in ExecMachineCodeBlock -- 1 argument expected\n");
      exit(1);
    }
  else
    {
      i::Handle<i::JSObject> jsobj = v8::Utils::OpenHandle(*args[0]);
      Handle<v8::internal::ExternalUnsignedByteArray> array(v8::internal::ExternalUnsignedByteArray::cast(jsobj->elements()));
      /* uint32_t len = static_cast<uint32_t>(array->length()); */
      uint8_t* block = static_cast<uint8_t*>(array->external_pointer());

      runtime_context rtc;

      rtc.stack_limit = 0; // TODO: actually set the correct limit
      rtc.heap_limit  = 0; // TODO: actually set the correct limit
      rtc.handlers[0] = CAST(c_handler, handler0);
      rtc.handlers[1] = CAST(c_handler, handler1);
      rtc.handlers[2] = CAST(c_handler, handler2);

      data_to_fn_ptr_caster ptr;

      ptr.data_ptr = block;

      word result = ptr.fn_ptr(&rtc); /* execute the code */

      return v8::Number::New(result);
    }
}


/*---------------------------------------------------------------------------*/

#define INIT_D8_EXTENSIONS init_d8_extensions(global_template)

void init_d8_extensions(v8::Handle<ObjectTemplate> global_template)
{
  global_template->Set(v8::String::New("writeFile"), v8::FunctionTemplate::New(WriteFile));
  global_template->Set(v8::String::New("allocMachineCodeBlock"), v8::FunctionTemplate::New(AllocMachineCodeBlock));
  global_template->Set(v8::String::New("freeMachineCodeBlock"), v8::FunctionTemplate::New(FreeMachineCodeBlock));
  global_template->Set(v8::String::New("execMachineCodeBlock"), v8::FunctionTemplate::New(ExecMachineCodeBlock));
}


/*===========================================================================*/