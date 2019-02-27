# Enabling/Disabling the Kiosk mode for the Windows player

When deploying the Windows player in production environment it is important to enable a Kiosk mode so that other applications or the taskbar does not appear on the windows desktop. Adobe recommends a device management solution to enable Kiosk for Windows. The method described here is only to be used if you do not have a device management solution to otherwise enable Kiosk. This method uses the Shell Launcher feature available in Windows 10 Enterprise and Edu. Any other Microsoft recommended means for non-UWP apps can also be applied to enable Kiosk especially on other editions of Windows.

**Step-by-step guide**

1. Ensure that you use Windows 10 Enterprise or Edu - https://support.microsoft.com/en-us/help/13443/windows-which-operating-system
2. Enable Shell Launcher - https://docs.microsoft.com/en-us/windows-hardware/customize/enterprise/shell-launcher
3. Create a non-administrative user (if you already do not have one) to be used for Kiosk. This can be a local or domain user.
4. Install the windows player for that Kiosk user from https://download.macromedia.com/screens/
5. Modify the PowerShell scripts to replace the username with the one you created. Ensure the path to the application executable is correct. This will set the custom shell as the windows player application for the kiosk user and set the default as explorer.exe for other users - https://docs.microsoft.com/en-us/windows/configuration/kiosk-shelllauncher
6. Run the PowerShell as administrator
7. To enable kiosk mode, change to the directory where you have the enablekiosk script and type .\enablekiosk.ps1
8. Reboot and login as the Kiosk user and the player application should start right up
9. To disable kiosk mode, run .\disablekiosk.ps1 in the folder where the scripts exist

---
**NOTE**

If you get a black screen when you login as the Kiosk user it means that you may have incorrectly specified the path to the windows player executable. Log back in as the administrator and verify and re-run the script

---

Congratulations! You have just enabled Kiosk mode for your Windows player