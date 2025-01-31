# mv - Move Files

## Overview

The `mv` command moves or renames files and directories.

## Basic Usage

```bash
mv [-f | -i | -n] [-hv] source target
mv [-f | -i | -n] [-v] source ... directory
```

## Description

The `mv` command has two main forms:

1. Rename a file (first form): moves `source` to `target`
2. Move files to directory (second form): moves multiple `source` files into an existing `directory`

## Options

- `-f` - Force overwrite without confirmation
- `-h` - Don't follow symbolic links to directories
- `-i` - Interactive mode (prompt before overwrite)
- `-n` - Do not overwrite existing files
- `-v` - Verbose mode (show files after moving)

Note: `-f`, `-i`, and `-n` override each other, with the last one taking effect.

## Important Notes

- Cannot move a directory to a target that exists and is not a directory
- Prompts for confirmation if destination is write-protected
- When moving across filesystems, `mv` uses `cp` and `rm` internally, equivalent to:
  ```bash
  rm -f destination_path && \
  cp -pRP source_file destination && \
  rm -rf source_file
  ```

## Examples

Rename file, overwriting if it exists:

```bash
mv -f foo bar
```

## Exit Status

- `0` - Success
- `>0` - Error occurred

## Legacy Behavior

In legacy mode, `mv dir/afile dir` fails silently with exit code 0. See compat(5) for details about legacy mode.

## Compatibility

The `-h`, `-n`, and `-v` options are non-standard and not recommended for scripts.

Note: Supports HFS+ Finder, Extended Attributes, and resource forks.

## See Also

- `cp(1)`
- `rm(1)`
- `symlink(7)`

## Standards

Conforms to IEEE Std 1003.2 ("POSIX.2")

## History

First appeared in Version 1 AT&T UNIX

macOS 15.1 March 15, 2013 macOS 15.1
