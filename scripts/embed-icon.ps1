param([Parameter(Mandatory)][string]$Executable,[Parameter(Mandatory)][string]$Icon)
$ErrorActionPreference='Stop'
Add-Type @"
using System;
using System.IO;
using System.Collections.Generic;
using System.ComponentModel;
using System.Runtime.InteropServices;
public class FieldNotebookIcon {
  delegate bool Name(IntPtr mod,IntPtr type,IntPtr name,IntPtr user);
  delegate bool Lang(IntPtr mod,IntPtr type,IntPtr name,ushort lang,IntPtr user);
  [DllImport("kernel32",CharSet=CharSet.Unicode)] static extern IntPtr LoadLibraryEx(string file,IntPtr reserved,uint flags);
  [DllImport("kernel32",CharSet=CharSet.Unicode)] static extern bool EnumResourceNames(IntPtr mod,IntPtr type,Name cb,IntPtr user);
  [DllImport("kernel32",CharSet=CharSet.Unicode)] static extern bool EnumResourceLanguages(IntPtr mod,IntPtr type,IntPtr name,Lang cb,IntPtr user);
  [DllImport("kernel32")] static extern bool FreeLibrary(IntPtr mod);
  [DllImport("kernel32",CharSet=CharSet.Unicode,SetLastError=true)] static extern IntPtr BeginUpdateResource(string file,bool clear);
  [DllImport("kernel32",CharSet=CharSet.Unicode,SetLastError=true)] static extern bool UpdateResource(IntPtr h,IntPtr type,IntPtr name,ushort lang,byte[] data,int len);
  [DllImport("kernel32",CharSet=CharSet.Unicode,SetLastError=true)] static extern bool EndUpdateResource(IntPtr h,bool discard);
  static void Put(IntPtr h,int type,int id,ushort lang,byte[] b){if(!UpdateResource(h,(IntPtr)type,(IntPtr)id,lang,b,b.Length))throw new Win32Exception();}
  public static void Apply(string exe,string icon){
    var groups=new List<Tuple<int,ushort>>();IntPtr m=LoadLibraryEx(exe,IntPtr.Zero,2);
    try{EnumResourceNames(m,(IntPtr)14,(mod,t,n,u)=>{if(n.ToInt64()>65535)throw new IOException("Unexpected named icon");EnumResourceLanguages(mod,t,n,(a,b,c,l,z)=>{groups.Add(Tuple.Create(n.ToInt32(),l));return true;},IntPtr.Zero);return true;},IntPtr.Zero);}finally{FreeLibrary(m);}
    if(groups.Count==0)groups.Add(Tuple.Create(1,(ushort)0));
    byte[] ico=File.ReadAllBytes(icon);int count=BitConverter.ToUInt16(ico,4);
    IntPtr h=BeginUpdateResource(exe,false);if(h==IntPtr.Zero)throw new Win32Exception();
    bool commit=false;try{foreach(var g in groups){
      var mem=new MemoryStream();var w=new BinaryWriter(mem);w.Write(ico,0,6);
      for(int i=0;i<count;i++){int d=6+i*16,len=BitConverter.ToInt32(ico,d+8),offset=BitConverter.ToInt32(ico,d+12);
        byte[] data=new byte[len];Array.Copy(ico,offset,data,0,len);Put(h,3,30000+i,g.Item2,data);w.Write(ico,d,12);w.Write((ushort)(30000+i));}
      Put(h,14,g.Item1,g.Item2,mem.ToArray());
    }commit=true;}finally{if(!EndUpdateResource(h,!commit))throw new Win32Exception();}
  }
}
"@
[FieldNotebookIcon]::Apply($Executable,$Icon)
