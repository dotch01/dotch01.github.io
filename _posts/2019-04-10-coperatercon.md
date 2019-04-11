---
layout: post
title:  "C++的判斷簡寫"
author: dot
categories: [ cpp, programming ]
image: assets/images/16.jpg
---

> 更新日期2019/04/11

說到程式裡的判斷，大家應該第一個都會想到常用的判別式if、else、else if

原本我也是這麼想的，直到有一天在看跟Unity有關的C#教學時，看到了類似這樣的東西

`int a = b > 1 && a != 5 ? 10 : 20;`

老實說第一次看到真的會滿頭問號，那些你可能原本在判別式中熟悉的運算子在這邊頓時變成了很可怕的東西

直到我開始自學了c++，終於搞明白了這串~~外星文~~字的意思

簡單的說，不管式子裡出現了多少問號，你就先從最中間的問號把兩邊分開，接著把中間的問號左右兩邊的東西改成if

就會變成

```cs
if(b > 1 && a != 5) a = 10;
```

那麼剩下的20呢？

很簡單，幫左右兩邊的if式子都分配完右邊還又剩下的數時，就想成``else``吧

最後整理一下，其實這個式子就等於

```cs
if(b > 1 && a != 5)
{
    a = 10;
} else {
    a = 20;
}
```

最後再練習個遊戲編成時可能會用到它的範例吧！

```cs
#include<iostream>

void main()
{
    int s_Speed;
    int s_Level = 1;

	s_Speed = s_Level > 5 && s_Level < 100 ? s_Level > 10 ? 15 : 10 : 5;
	//表示s_Level > 5 && < 100時 s_Speed = 10, 或者 s_Level > 10時 s_Speed = 15，前兩者都不滿足時 s_Speed = 5

    std::cout << s_Speed << std::endl; //輸出為5
}
```
