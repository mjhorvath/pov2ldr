pov2ldr 0.5.0 beta
Michael Horvath <mhorvath2161_at_juno_dot_com>
This file is licensed under the terms of the LGPL.

This tool is meant to "extract" MPD files from POV files generated using L3P by 
Lars C. Hassing. The program requires that the Windows Scripting Host be 
installed. I think all recent versions of Windows come with it, so there's 
probably no need to worry. The program has been tested to work with three 
fairly complex MPDs created by both the 1.3 and 1.4 beta versions of L3P. The 
program may fail if a POV file has subsequently been edited by hand by the 
another person. The program also currently ignores any comments in the POV 
file, such as original author information and other metadata.

The program takes up to five arguments, two of which are optional, and another 
of which should not be needed in most cases.

1) [path to the input file]
2) [path to the output file]
3) -ldd[path to LDraw directory]
4) -o (overwrite)
5) -auth[name of author]

You must wrap the arguments in quotation marks if the text being passed 
contains any spaces. In addition, you need to add "cscript" and the path to 
"pov2ldr.js" to the beginning of the command-line since the file makes use of 
the Windows Scripting Host. Here's an example of a well-formed command-line. 
Note how my name is wrapped in quotation marks after "-auth".

cscript "J:\Working\Povray\LDraw\pov2ldr\pov2ldr.js"
	"J:\Working\Povray\LDraw\web_miningfacility.pov"
	"J:\Working\Povray\LDraw\web_miningfacility.mpd"
	-o -auth"Michael Horvath"

The "-ldd" flag may not be needed because the program will first try to locate 
the LDraw path in either the "LDRAWDIR" environmental variable or "ldraw.ini".
