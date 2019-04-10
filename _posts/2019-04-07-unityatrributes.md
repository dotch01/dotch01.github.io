---
layout: post
title:  "Unity透過attribute自定義腳本、元件視窗"
author: dot
categories: [ Unity, programming ]
tags: [ Unity, attribute ]
image: assets/images/16.jpg
beforetoc: "你是否有在Unity中撰寫腳本後，發現編輯器中的可更改變數多到密密麻麻又都是英文要一一看懂很累的情況？"
toc: true
featured: false
hidden: false
---



#### Introduction



又或者有不想讓這個變數變成公用的但又不想在文字編輯器裡慢慢改動的困擾呢？

這時候 **Attribute** 會是你的好幫手，它可以讓你在Unity裡更輕鬆愉快的使用編輯器去調整腳本變數。

要呼喚它的方式也很輕鬆，基本上就是 `["使用方法"]` 並寫在變數之前就可以在Unity編輯器中看到效果了

大概寫了一個小範例



#### Code example



```csharp
[DisallowMultipleComponent] //限制不能再同個物件上重複添加此腳本
[AddComponentMenu("職業基本數值/數值設定/script")] //把這個腳本加到Unity的選項Component並創建一個分類叫做"職業基本數值">"數值設定"裡的script選下去後就可以把這個腳本加到物件裡
[RequireComponent(typeof(myscript),typeof(BoxCollider2D))] //當插入此腳本的時候會自動檢測此物件上有無myscript腳本和Collider2D元件，若無會自動新增，並且無法刪除他們
public class BeautifulScript : MonoBehaviour {

	[SerializeField] //假如你想編輯被保密(private)或保護(protected)的變數，在上面加上它就可以在編輯器裡看到該變數
	private float game_time;

	#region 玩家基本數值
	[System.Serializable] //序列化此結構，讓它能在Unity上編輯
    public struct HP_stuff
    {
		[Header("血量設定")] //可以用來描述你的變數
		[Space(10)] //排版變數之間或與Header的距離，看起來更容易閱讀		
		[Range(1,1000)] //讓數字類型變數可以用一個bar來調整，並設定區間
		[Tooltip("設定初始血量")] //在滑鼠指到該變數上時，會跑出提示
		[ContextMenuItem("設定fighter初始血量500","fighter_Hp")] //在p_Hp變數上點選右鍵可以進行設定，呼叫fighter_Hp該函式自動設定變數為500
        public float p_Hp;
		[Space(10), Range(1,10000), Tooltip("設定最高血量")]				
        public float p_Max_Hp;
		[Space(10)]		
		[Range(100,500)]
		[Tooltip("等級提升增加血量")]
		[HideInInspector] //在編輯器中隱藏這個變數，會使上面的設定完全無效並隱藏變數
        public float p_Level_Hp;

    }

	[System.Serializable]	
    public struct Player_Info_stuff
    {
        public string p_Name;
        public int p_Level;
		[Multiline(3)] //可以設定String變數顯示的最大行數
		[TextArea(3,6)] //可以設定String變數顯示的最大行數，和設定顯示到第幾行的時候剩下的部分變成拖拉卷軸才能看到
		public string p_Job_Info;

    }

	[System.Serializable]
	public struct Player_Job_Stuff 
	{
		public HP_stuff Player_Hp_Set;
		public Player_Info_stuff Player_Info_Set;
	}
	#endregion

	public Player_Job_Stuff fighter, knight, priest, wizard, thief, enhancer, grappler, harpist, ranger, lancer;

	void fighter_Hp()
	{
		fighter.Player_Hp_Set.p_Hp = 500;

	}

	[ContextMenu("設定fighter最高血量為5000")] //點下在元件旁的小齒輪後，可以看到此設定，按下就可呼叫寫在他頭上的函式
	void fighter_MaxHp_5k()
	{
		fighter.Player_Hp_Set.p_Max_Hp = 5000;
	}

}
```



#### Summary



看完上面的碼應該還是霧煞煞，下面在來個總整理吧！



`[DisallowMultipleComponent]`：必須寫在Class前，代表同一個物件不能重複放入這個腳本。

`[AddComponentMenu(component選項路徑)]`：必須寫在Class前，可以在Unity上方的Component選項和物件的Add Component快速新增此腳本，路徑可以無限延長。

`[RequireComponent(typeof(元件或腳本)]`：必須寫在Class前，當插入此腳本的時候會自動檢測此物件上有無指定的腳本和元件，若無會自動新增，並且只要此腳本還在物件上就無法刪除他們。

`[SerializeField]`：必須寫在變數前，假如你想編輯被保密(private)或保護(protected)的變數，在上面加上它就可以在編輯器裡看到該變數。

`[Header("文字")]`：必須寫在變數前，可以用來描述你的變數。

`[Space(間隔距離)]`：必須寫在變數前，排版與變數之間或Header的距離，看起來更容易閱讀。

`[Range(最小值,最大值)]`：必須寫在變數前，讓數字類型變數可以用一個bar來調整，並設定區間。

`[Tooltip("文字")]`：必須寫在變數前，在滑鼠指到該變數上時，會跑出提示。

`[ContextMenuItem("文字","呼叫函式名稱")]`：必須寫在變數前，在p_Hp變數上點選右鍵可以進行設定，呼叫fighter_Hp該函式自動設定變數為500。

`[HideInInspector]`：必須寫在變數前，假如有你不想編輯的公共(public)變數，它可以讓編輯器隱藏這個變數。

`[Multiline(行數)]`：必須寫在變數前，可以設定String變數顯示的最大行數。

`[TextArea(一開始顯示行數,最多顯示行數)]`：必須寫在變數前，可以設定String變數顯示的最大行數，和設定顯示到第幾行的時候剩下的部分變成拖拉卷軸才能看到。

`[ContextMenu("選項文字")]`：必須寫在函式前，新增元件旁的小齒輪選項，可以看到此設定。



**補充**

假如你需要的設定跟我的範例一樣非常多

又要行列式的一條一條打出來會讓程式碼看起來太冗長也可以把所有設定寫成類似

`[Space(10), Range(1,10000), Tooltip("設定最高血量")]`

只要把哪些方法是寫在class、variable、function前記清楚就好了

