// This file is licensed under the terms of the LGPL.
var program_version = 'pov2ldr 0.5.0 beta\nMichael Horvath <mhorvath2161_at_juno_dot_com>\nThis file is licensed under the terms of the LGPL.'
var program_args = WScript.Arguments
var WshShell = WScript.CreateObject('WScript.Shell')
var fso = new ActiveXObject('Scripting.FileSystemObject')
var path_current = WshShell.CurrentDirectory

WScript.echo(program_version)

if (program_args.length < 2)
{
	WScript.echo('ERROR: There must be at least two arguments.')
	WScript.Quit(1)
}

var path_ldraw = ''
var string_author = 'pov2ldr'
var path_input = program_args(0)
var path_output = program_args(1)
var program_overwrite = 0
for (var i = 2, n = program_args.length; i < n ; i++)
{
	var this_arg = program_args(i)
	if (this_arg.match('-ldd'))
		path_ldraw = this_arg.replace('-ldd', '')
	if (this_arg.match('-auth'))
		string_author = this_arg.replace('-auth', '')
	if (this_arg == '-o')
		program_overwrite = 1
}

if (path_output.substring(path_output.length - 4, path_output.length).toLowerCase() != '.mpd')
{
	WScript.echo('ERROR: The program currently only supports writing to MPD files.')
	WScript.Quit(1)
}

if (path_input.indexOf('\\') == -1)
	path_input = path_current + '\\' + path_input
if (path_output.indexOf('\\') == -1)
	path_output = path_current + '\\' + path_output
	

if (path_ldraw == '')
{
	var WshSysEnv_sys = WshShell.Environment('system')
	path_ldraw = WshSysEnv_sys('LDRAWDIR')
	if (path_ldraw == '')
	{
		var path_windir = WshSysEnv_sys('WINDIR')
		if (path_windir.toLowerCase() == '%systemroot%')
		{
			var WshSysEnv_prc = WshShell.Environment('process')
			path_windir = WshSysEnv_prc('SYSTEMROOT')
		}
		var path_ldrawini = path_windir + '\\ldraw.ini'
		if (fso.FileExists(path_ldrawini))
		{
			var file_ldrawini = fso.OpenTextFile(path_ldrawini, 1)
			var string_ldrawini = file_ldrawini.ReadAll()
			path_ldraw = string_ldrawini.replace(/\r\n/gm, '\n').replace(/\r/gm, '\n').match(/^BaseDirectory.*/m)[0].replace(/BaseDirectory\=/, '')
		}
		else
			path_ldraw = 'C:\\LDraw'
	}
}

if (path_ldraw.charAt(path_ldraw.length - 1) != '\\')
	path_ldraw = path_ldraw + '\\'

if (!fso.FolderExists(path_ldraw))
{
	WScript.echo('ERROR: LDraw path not found.')
	WScript.Quit(1)
}
if (!fso.FileExists(path_input))
{
	WScript.echo('ERROR: Input file not found.')
	WScript.Quit(1)
}
if (fso.FileExists(path_output) && program_overwrite == 0)
{
	WScript.echo('ERROR: Program is set to not overwrite existing files.')
	WScript.Quit(1)
}

WScript.echo('...')

var file_input = fso.OpenTextFile(path_input, 1)
var string_input = file_input.ReadAll().replace(/\r\n/gm, '\n').replace(/\r/gm, '\n')
file_input.Close()
var string_output = ''
var array_badobj = ['l3logo']

var path_parts = path_ldraw + 'parts\\'
var folder_parts = fso.GetFolder(path_parts)
var enum_parts = new Enumerator(folder_parts.files)
for (; !enum_parts.atEnd(); enum_parts.moveNext())
{
	var string_part = enum_parts.item().Name.replace(path_parts, '').toLowerCase()
	array_badobj.push(string_part)
}
path_parts = path_ldraw + 'parts\\s\\'
folder_parts = fso.GetFolder(path_parts)
enum_parts = new Enumerator(folder_parts.files)
for (; !enum_parts.atEnd(); enum_parts.moveNext())
{
	var string_part = enum_parts.item().Name.replace(path_parts, '').toLowerCase()
	array_badobj.push(string_part)
}
path_parts = path_ldraw + 'p\\'
folder_parts = fso.GetFolder(path_parts)
enum_parts = new Enumerator(folder_parts.files)
for (; !enum_parts.atEnd(); enum_parts.moveNext())
{
	var string_part = enum_parts.item().Name.replace(path_parts, '').toLowerCase()
	array_badobj.push(string_part)
}
path_parts = path_ldraw + 'p\\48\\'
folder_parts = fso.GetFolder(path_parts)
enum_parts = new Enumerator(folder_parts.files)
for (; !enum_parts.atEnd(); enum_parts.moveNext())
{
	var string_part = enum_parts.item().Name.replace(path_parts, '').toLowerCase()
	array_badobj.push(string_part)
}

WScript.echo('...')

var array_regexp =
[
	/#declare\s*(\w+)/m,
	/\w+/,
	/_dot_/,
	/^_/,
	/_dash_/,
	/s_slash_/,
	/_slash_/,
	/__/gm,
	/_slope$/,
	/_clear$/,
	/[.\n]*object\s*\{\s*(\w+)/m,
	/matrix.*$/mg,
	/matrix\s*/,
	/\<[^\>]*\>/g,
	/\<([^\>]*)\>/,
	/\s*/gm,
	/material.*\{.*\}/m,
	/material.*\{\s*(\w+)\s*\}.*/,
	/object\s*\{/
]

var array_modelobj = []
var match_b = string_input.match(/\#declare.*object/g)
for (var count_i = 0, limit_n = match_b.length; count_i < limit_n; count_i++)
{
	parse_object(count_i)
}
match_b = string_input.match(/\#declare.*union/g)
for (var count_i = 0, limit_n = match_b.length; count_i < limit_n; count_i++)
{
	parse_object(count_i)
}

function parse_object(count_i)
{
	var passbool = 1
	var index_b = string_input.indexOf(match_b[count_i])
	var string_c = string_input.substring(index_b, string_input.length - 1)
	var index_c = string_c.indexOf('\n}\n')
	var string_d = string_c.substring(0, index_c + 2)
	var string_supname = string_d.replace(array_regexp[0], '$1').match(array_regexp[1])[0].replace(array_regexp[2], '.').replace(array_regexp[3], '').replace(array_regexp[4], '-').replace(array_regexp[5], '').replace(array_regexp[6], '-').replace(array_regexp[7], '_').replace(array_regexp[8], '').replace(array_regexp[9], '')
	for (var count_j = 0, o = array_badobj.length; count_j < o; count_j++)
	{
		if (string_supname.toLowerCase() == array_badobj[count_j])
		{
			passbool = 0
			break
		}
	}
	if (passbool)
	{

		var string_model = '0\n'
		+ '0 FILE ' + string_supname + '\n'
		+ '0 Name: ' + string_supname + '\n'
		+ '0 WRITE Author: ' + string_author + '\n'
		+ '0 ROTATION CENTER 0 0 0 1 "Custom"\n'
		+ '0 ROTATION CONFIG 0 0\n'

		var match_d = string_d.match(/^\s*object\s*\{/gm)
		if (match_d)
		{
			for (var count_j = 0, limit_o = match_d.length; count_j < limit_o; count_j++)
			{
				var index_d = string_d.indexOf(match_d[count_j])
				var string_e = string_d.substring(index_d, string_d.length - 1)
				var index_e = string_e.indexOf('}\n')
				var string_f = string_e.substring(0, index_e + 4)

				var string_subname = string_f.replace(array_regexp[10], '$1').match(array_regexp[1])[0].replace(array_regexp[2], '.').replace(array_regexp[3], '').replace(array_regexp[4], '-').replace(array_regexp[5], '').replace(array_regexp[6], '-').replace(array_regexp[7], '_').replace(array_regexp[8], '').replace(array_regexp[9], '')
				var match_matrix_a = string_f.match(array_regexp[11])
				var string_matrix = match_matrix_a[match_matrix_a.length - 1].replace(array_regexp[12], '')
				var match_matrix_b = string_matrix.match(array_regexp[13])
				string_matrix = match_matrix_b[match_matrix_b.length - 1].replace(array_regexp[14], '$1')
				string_matrix = string_matrix.replace(array_regexp[15], '')
				var array_matrix = string_matrix.split(',')
				var match_color = string_f.match(array_regexp[16])
				var string_color = 0
				if (match_color)
					string_color = match_color[0].replace(array_regexp[17], '$1').replace('L3Color', '').replace('Color', '').replace(array_regexp[15], '')
				string_d = string_d.replace(array_regexp[18])
				string_model += '1 '
				+ string_color + ' '
				+ array_matrix[9] + ' '
				+ array_matrix[10] + ' '
				+ array_matrix[11] + ' '
				+ array_matrix[0] + ' '
				+ array_matrix[3] + ' '
				+ array_matrix[6] + ' '
				+ array_matrix[1] + ' '
				+ array_matrix[4] + ' '
				+ array_matrix[7] + ' '
				+ array_matrix[2] + ' '
				+ array_matrix[5] + ' '
				+ array_matrix[8] + ' '
				+ string_subname + '\n'
			}
		}
		array_modelobj.push(string_model)
	}
}

WScript.echo('...')

array_modelobj = array_modelobj.reverse()
string_output = array_modelobj.join('')

//WScript.echo(string_output)

var file_output = fso.OpenTextFile(path_output, 2, 1)
file_output.Write(string_output)
file_output.Close()
