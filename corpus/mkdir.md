# mkdir - Make Directories

## Overview

The `mkdir` command creates new directories.

## Basic Usage

```bash
mkdir [options] directory_name...
```

## Options

- `-m mode` - Set custom permissions for created directory
  - Accepts same formats as `chmod`
  - For symbolic modes, '+' and '-' are relative to "a=rwx"
- `-p` - Create parent directories as needed
  - No error if directory already exists
  - Creates intermediate directories with 0777 (modified by umask)
  - Owner gets additional write and search permissions
- `-v` - Verbose mode (display directories as they're created)

## Description

`mkdir` creates directories with default permissions of "rwxrwxrwx" (0777), modified by the current umask setting.

Important: User must have write permission in the parent directory.

## Examples

Create a simple directory:

```bash
mkdir foobar
```

Create directory with specific permissions:

```bash
mkdir -m 700 foobar
```

Create nested directories (creates parent directories if needed):

```bash
mkdir -p cow/horse/monkey
```

## Exit Status

- `0` - Success
- `>0` - Error occurred

## Compatibility Note

The `-v` option is non-standard and not recommended for scripts.

## See Also

- `rmdir(1)`

## Standards

Conforms to IEEE Std 1003.2 ("POSIX.2")

## History

First appeared in Version 1 AT&T UNIX

macOS 15.1 March 15, 2013 macOS 15.1
