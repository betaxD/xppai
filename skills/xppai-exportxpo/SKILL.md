---
name: xppai-exportxpo
description: Use when you need to export a list of AX 2009 AOT objects to XPO files — generates a ready-to-paste X++ job given object names or full AOT paths.
---

# XppAI ExportXPO — Code Generator

Generate a ready-to-paste X++ static job to export a list of AX 2009 AOT objects to XPO files.

## How to Use

Provide a list of objects to export. Each object can be:
- **Full AOT path** (e.g., `\Classes\SalesFormLetter`)
- **Type + Name** (e.g., `Class: SalesFormLetter` or `Table: SalesLine`)

The skill resolves paths using the built-in map below, generates a complete X++ job, and outputs it ready to paste into a new Job in MorphX.

## AOT Path Map

Resolution rule: if input starts with `\`, use as-is. Otherwise look up the type keyword in this table and build `\Prefix\Name`.

| Type keyword | AOT prefix |
|---|---|
| `Class` | `\Classes` |
| `Table` | `\Data Dictionary\Tables` |
| `Map` | `\Data Dictionary\Maps` |
| `View` | `\Data Dictionary\Views` |
| `Enum` | `\Data Dictionary\Base Enums` |
| `EDT` | `\Data Dictionary\Extended Data Types` |
| `Form` | `\Forms` |
| `Query` | `\Queries` |
| `Report` | `\SSRS Reports\Reports` |
| `Job` | `\Jobs` |

## Behavior

1. Read the user-provided list of objects
2. Resolve each to a full AOT path (full paths pass through, `Type: Name` pairs are expanded using the map)
3. Generate a single X++ static job with all resolved paths in the `exportPaths` container
4. Output the job in a fenced code block (no surrounding prose)

## Generated Job Structure

```xpp
static void PapaiExportXPO(Args _args)
{
    TreeNode            treeNode;
    FileIoPermission    perm;
    container           exportPaths;
    str                 exportFolder;
    str                 objectPath;
    str                 objectName;
    str                 fileName;
    int                 i;
    int                 exported;
    int                 failed;
    ;

    exportFolder = @'C:\temp\xpo_export\';

    // All objects to be exported
    exportPaths = [
        // [resolved paths inserted here]
    ];

    exported = 0;
    failed   = 0;

    for (i = 1; i <= conLen(exportPaths); i++)
    {
        objectPath = conPeek(exportPaths, i);

        // Build filename from last segment of path
        objectName = substr(objectPath, strFind(objectPath, '\\', strLen(objectPath), -strLen(objectPath)) + 1,
            strLen(objectPath));
        fileName   = exportFolder + objectName + '.xpo';

        treeNode = TreeNode::findNode(objectPath);

        if (treeNode)
        {
            perm = new FileIoPermission(fileName, 'W');
            perm.assert();

            treeNode.treeNodeExport(fileName);

            CodeAccessPermission::revertAssert();

            info(strFmt("Exported: %1 → %2", objectPath, fileName));
            exported++;
        }
        else
        {
            warning(strFmt("NOT FOUND in AOT: %1", objectPath));
            failed++;
        }
    }

    info(strFmt("Done. Exported: %1 | Not found: %2 | Folder: %3",
                exported, failed, exportFolder));
}
```

The export folder is hardcoded to `C:\temp\xpo_export\`. Modify if needed before running the job in MorphX.

## Example

**Input:**
```
Class: SalesFormLetter
Table: SalesLine
\Classes\TaxSales
Map: LogMap
```

**Output:**
```xpp
static void PapaiExportXPO(Args _args)
{
    TreeNode            treeNode;
    FileIoPermission    perm;
    container           exportPaths;
    str                 exportFolder;
    str                 objectPath;
    str                 objectName;
    str                 fileName;
    int                 i;
    int                 exported;
    int                 failed;
    ;

    exportFolder = @'C:\temp\xpo_export\';

    // All objects to be exported
    exportPaths = [
        @'\Classes\SalesFormLetter',
        @'\Data Dictionary\Tables\SalesLine',
        @'\Classes\TaxSales',
        @'\Data Dictionary\Maps\LogMap'
    ];

    exported = 0;
    failed   = 0;

    for (i = 1; i <= conLen(exportPaths); i++)
    {
        objectPath = conPeek(exportPaths, i);

        // Build filename from last segment of path
        objectName = substr(objectPath, strFind(objectPath, '\\', strLen(objectPath), -strLen(objectPath)) + 1,
            strLen(objectPath));
        fileName   = exportFolder + objectName + '.xpo';

        treeNode = TreeNode::findNode(objectPath);

        if (treeNode)
        {
            perm = new FileIoPermission(fileName, 'W');
            perm.assert();

            treeNode.treeNodeExport(fileName);

            CodeAccessPermission::revertAssert();

            info(strFmt("Exported: %1 → %2", objectPath, fileName));
            exported++;
        }
        else
        {
            warning(strFmt("NOT FOUND in AOT: %1", objectPath));
            failed++;
        }
    }

    info(strFmt("Done. Exported: %1 | Not found: %2 | Folder: %3",
                exported, failed, exportFolder));
}
```
