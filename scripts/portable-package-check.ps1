param([Parameter(Mandatory=$true)][string]$Archive)
$ErrorActionPreference='Stop'
Remove-Item Env:ELECTRON_RUN_AS_NODE -ErrorAction SilentlyContinue
Add-Type @"
using System;
using System.Text;
using System.Collections.Generic;
using System.Runtime.InteropServices;
public static class PreviewWindows {
  public delegate bool EnumProc(IntPtr h, IntPtr a);
  [DllImport("user32.dll")] static extern bool EnumWindows(EnumProc cb, IntPtr a);
  [DllImport("user32.dll")] static extern bool EnumChildWindows(IntPtr h,EnumProc cb,IntPtr a);
  [DllImport("user32.dll")] static extern uint GetWindowThreadProcessId(IntPtr h,out uint pid);
  [DllImport("user32.dll",CharSet=CharSet.Unicode)] static extern int GetWindowText(IntPtr h,StringBuilder s,int n);
  [DllImport("user32.dll")] static extern bool PostMessage(IntPtr h,uint msg,IntPtr a,IntPtr b);
  public static string Inspect(uint process,bool choose){
    var titles=new List<string>();
    EnumProc inspect=(h,a)=>{var s=new StringBuilder(2048);GetWindowText(h,s,s.Capacity);var t=s.ToString();if(t.Length>0)titles.Add(t);
      if(choose && (t.Contains("Start with an empty library")||t.Contains("Начать с пустой библиотеки")))PostMessage(h,0x00F5,IntPtr.Zero,IntPtr.Zero);
      return true;};
    EnumWindows((h,a)=>{uint pid;GetWindowThreadProcessId(h,out pid);if(pid==process){inspect(h,a);EnumChildWindows(h,inspect,a);}return true;},IntPtr.Zero);
    return string.Join(" | ",titles);
  }
}
"@
Add-Type -AssemblyName UIAutomationClient
Add-Type -AssemblyName UIAutomationTypes
$zip=Get-Item -LiteralPath $Archive
if((Get-FileHash -LiteralPath $zip.FullName).Hash -ne (Get-Content -LiteralPath ($zip.FullName+'.sha256')).Split(' ')[0]){throw 'ZIP checksum mismatch'}
$list=@(tar -tf $zip.FullName)
if($LASTEXITCODE -or ($list | Where-Object {$_ -match '/data/.+|\.(sav|gba|nds|dmp|pem|pfx|key|env|toml|ini)$|/emulators/|/\.git/'})){throw 'Unexpected ZIP entries'}
$work=New-Item -ItemType Directory (Join-Path $env:TEMP ('portable-exe-'+[guid]::NewGuid()))
tar -xf $zip.FullName -C $work.FullName
if($LASTEXITCODE){throw 'Extraction failed'}
$install=Join-Path $work.FullName 'PokedexHelper'
function Check-Launch([string]$folder,[bool]$first){
  $process=Start-Process -FilePath (Join-Path $folder 'PokedexHelper.exe') -WorkingDirectory $work.FullName -PassThru -WindowStyle Hidden
  try {
    $deadline=(Get-Date).AddSeconds(45)
    while((Get-Date) -lt $deadline){
      $process.Refresh()
      if($process.HasExited){throw "Exited before opening application: $($process.ExitCode)"}
      $titles=[PreviewWindows]::Inspect($process.Id,$first)
      if($titles -like '*Platinum*' -and (Test-Path -LiteralPath (Join-Path $folder 'data/library/config/preferences-v1.json'))){break}
      if($first){
        $windows=[System.Windows.Automation.AutomationElement]::RootElement.FindAll([System.Windows.Automation.TreeScope]::Children,(New-Object System.Windows.Automation.PropertyCondition([System.Windows.Automation.AutomationElement]::ProcessIdProperty,$process.Id)))
        foreach($window in $windows){
          $buttons=$window.FindAll([System.Windows.Automation.TreeScope]::Descendants,(New-Object System.Windows.Automation.PropertyCondition([System.Windows.Automation.AutomationElement]::ControlTypeProperty,[System.Windows.Automation.ControlType]::Button)))
          foreach($button in $buttons){if($button.Current.Name -match 'Start with an empty library|Начать с пустой библиотеки'){$button.GetCurrentPattern([System.Windows.Automation.InvokePattern]::Pattern).Invoke();$first=$false;break}}
        }
      }
      Start-Sleep -Milliseconds 250
    }
    if($titles -notlike '*Platinum*'){throw "Application window unavailable: $titles"}
    foreach($f in 'data/library/config/library.json','data/library/config/connections.json','data/portable.json','data/library/config/preferences-v1.json','data/cache/chromium','data/cache/electron'){
      if(!(Test-Path -LiteralPath (Join-Path $folder $f))){throw "Missing $f"}
    }
    Write-Output "Packaged EXE started: $folder"
  }finally{
    if(!$process.HasExited){[void]$process.CloseMainWindow();if(!$process.WaitForExit(5000)){$process.Kill();$process.WaitForExit()}}
  }
}
Check-Launch $install $true
$prefs=Join-Path $install 'data/library/config/preferences-v1.json'
$settings=Get-Content -Encoding UTF8 -Raw -LiteralPath $prefs | ConvertFrom-Json
$settings | Add-Member -Force -NotePropertyName configured -NotePropertyValue $true
$settings.deferred | Add-Member -Force -NotePropertyName '446' -NotePropertyValue $true
[IO.File]::WriteAllText($prefs,($settings | ConvertTo-Json -Depth 30),[Text.UTF8Encoding]::new($false))
$new=Join-Path $work.FullName 'Мои игры Pokédex'
if([IO.Path]::GetDirectoryName([IO.Path]::GetFullPath($install)) -ne $work.FullName -or [IO.Path]::GetDirectoryName([IO.Path]::GetFullPath($new)) -ne $work.FullName){throw 'Unexpected test directory'}
Move-Item -LiteralPath $install -Destination $new
$letter=@('V:','W:','X:') | Where-Object {!(Test-Path "$_\")} | Select-Object -First 1
if(!$letter){throw 'No free drive letter'}
subst $letter $work.FullName
if($LASTEXITCODE){throw 'Could not map test drive'}
try{
  $relocated=Join-Path "$letter\" (Split-Path $new -Leaf)
  Check-Launch $relocated $false
  $after=Get-Content -Raw -Encoding UTF8 -LiteralPath (Join-Path $relocated 'data/library/config/preferences-v1.json') | ConvertFrom-Json
  if(!$after.configured -or !$after.deferred.'446'){throw 'Relocated preferences mismatch'}
}finally{subst $letter /D}
Write-Output 'ZIP, clean EXE launch and relocated restart passed.'
