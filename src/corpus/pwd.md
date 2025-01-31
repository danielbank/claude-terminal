# pwd - Print Working Directory

## Overview

The `pwd` command displays the current working directory path.

## Basic Usage

```bash
pwd [options]
```

## Options

- `-L` - Display the logical current working directory (default)
- `-P` - Display the physical current working directory (resolve all symbolic links)

## Description

`pwd` writes the absolute pathname of the current working directory to standard output.

Note: Some shells provide a built-in `pwd` command that may be similar or identical to this utility.

## Environment Variables

- `PWD` - Logical current working directory

## Exit Status

- `0` - Success
- `>0` - Error occurred

## Examples

Show current working directory with symbolic links resolved:

```bash
$ /bin/pwd -P
/usr/home/fernape
```

Show the logical current directory:

```bash
$ /bin/pwd
/home/fernape
$ file /home
/home: symbolic link to usr/home
```

## Known Issues

- In csh(1), the `dirs` command is faster (built-in) but may give different results if directories are moved after the shell descends into them
- The `-L` option requires the PWD environment variable to be exported by the shell

## See Also

- `builtin(1)`
- `cd(1)`
- `csh(1)`
- `realpath(1)`
- `sh(1)`
- `getcwd(3)`

## Standards

Conforms to IEEE Std 1003.1-2001 ("POSIX.1")

## History

First appeared in Version 5 AT&T UNIX
