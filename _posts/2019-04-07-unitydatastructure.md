---
layout: post
title:  "使用Unity製作簡單的數值編輯腳本"
author: dot
categories: [ Unity, programming ]
tags: [ Unity, data structure ]
image: assets/images/16.jpg
beforetoc: "讓你的程式變得乾乾淨淨吧！"
toc: true
featured: false
hidden: false
---



#### Introduction



在這篇<a href="{{ site.baseurl }}/unityatrributes/">文章</a>裡，提到了能更輕鬆愉快的使用Unity編輯器的方法

接下來講講要如何讓你的變數在程式碼中看起來更好閱讀吧

我直接用上次的範例程式，加了點額外的東西，讓它看起來像個職業數值編輯器

如果對[]內的東西很好奇的話就去看看上面連結的文章吧


#### Code example



```C#
using UnityEngine;

[DisallowMultipleComponent]
[AddComponentMenu("職業基本數值/數值設定/我的編輯器")]
[RequireComponent(typeof(myscript))]
public class BeautifulScript : MonoBehaviour 
{
	[Space(15)]	
	public Player_Job_Stuff fighter, knight, priest, wizard, thief;
	[Space(15)]
	public Player_Job_Stuff enhancer, grappler, harpist, ranger, lancer;
	
	void fighter_Hp()
	{
		fighter.Player_Hp_Set.p_Hp = 500;

	}

	[ContextMenu("設定fighter最高血量為5000")]
	void fighter_MaxHp_5k()
	{
		fighter.Player_Hp_Set.p_Max_Hp = 5000;
	}

}

#region 玩家基本數值
[System.Serializable] //序列化此結構，讓它能在Unity上編輯
public struct HP_stuff
{
    [Header("血量設定")]
    [Space(10)]		
    [Range(1,1000)]
    [Tooltip("設定初始血量")]
    [ContextMenuItem("設定fighter初始血量500","fighter_Hp")]
    public float p_Hp;
    [Space(10), Range(1,10000), Tooltip("設定最高血量")]				
    public float p_Max_Hp;
    [Space(10)]		
    [Range(100,500)]
    [Tooltip("等級提升增加血量")]
    [HideInInspector]
    public float p_Level_Hp;

}

[System.Serializable]	
public struct SP_stuff
{
    public float p_Sp;
    public float p_Max_Sp;
    public float p_Level_Sp;

}

[System.Serializable]	
public struct Player_Info_stuff
{
    public string p_Name;
    public int p_Level;
    [Multiline(3)]
    [TextArea(3,6)]
    public string p_Job_Info;

}

[System.Serializable]	
public struct Attack_stuff
{
    public float p_Attack;
    public float p_Level_Attack;

}

[System.Serializable]	
public struct Defense_stuff
{
    public float p_Defense;
    public float p_Level_Defense;

}

[System.Serializable]	
public struct Critical_stuff
{
    public float p_Critical;
    public float p_Level_Critical;

}

[System.Serializable]
public struct Player_Job_Stuff 
{
    public HP_stuff Player_Hp_Set;
    public SP_stuff Player_Sp_Set;
    public Player_Info_stuff Player_Info_Set;
    public Attack_stuff Player_Attack_Set;
    public Defense_stuff Player_Defense_Set;
    public Critical_stuff Player_Critical_Set;
}
#endregion

```



#### Summary



在這裡我們用到了一個新的宣告方式叫做結構(struct)，它跟類別(class)的差別就跟在C++裡一樣

假如你沒有指定變數是公用還是保密或是保護

**結構的變數預設是公用，類別則是保密**

但在這邊我一樣在宣告的變數前加了public，是為了讓可讀性更高而已

為了讓編輯器可以分開每一個數值，把他們拆成了血量、魔法值、攻擊力、角色資訊等等

最後在把他們合成一個結構Player_Job_Stuff，並在開頭繼承了Unity MonoBehaviour的類別宣告成不同職業，如此一來就能在編輯器上分開設定每個職業的基本數值了。

這邊就另外再記錄一下一些陌生面孔吧

`#region 註解 [程式碼] #endregion` 

它對你的腳本沒有直接的影響，但它可以框住任何包含在內的程式碼，讓你在VScode、VisualStudio又或者Unity內鍵的編輯器中可以自由的把它開啟或收起

對於程式碼的可讀性它會起到很大的幫助

`[System.Serializable]`：想讓每個結構中的變數可以在Unity內編輯的話，就得在前面加上這個將包好的資料序列化


