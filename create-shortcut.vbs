Set WshShell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")

desktopPath = WshShell.SpecialFolders("Desktop")
scriptDir = fso.GetParentFolderName(WScript.ScriptFullName)
shortcutPath = desktopPath & "\SoundBoard.lnk"

Set shortcut = WshShell.CreateShortcut(shortcutPath)
shortcut.TargetPath = scriptDir & "\SoundBoard.vbs"
shortcut.WorkingDirectory = scriptDir
shortcut.WindowStyle = 7
shortcut.Description = "Launch SoundBoard"
shortcut.Save

MsgBox "SoundBoard shortcut created on your desktop!", vbInformation, "SoundBoard"
