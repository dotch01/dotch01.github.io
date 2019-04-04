---
layout: post
title:  "C++的定義"
author: dot
categories: [ c++, programming, note ]
image: assets/images/16.jpg
---

#### C++關於定義的筆記

定義的用法還蠻多的，除了可以節省重複編寫程式碼以外

還可以設定在debug或release等巨集下定義的內容變換

不過如果只是用來定義重複的程式碼直接放到標頭檔在引用可讀性和碼的簡潔度應該會高一點

```c
#define WAIT std::cin.get(); //用WAIT定義std::cin.get();
#define OPEN_CURLY {

#if PR_DEBUG == 1 //屬性->C++中的的前置處理器定義可設定在不同模式或平台下使用到的巨集
#define LOG(x) std::cout << x << std::endl;
#elif defined(PR_RELEASE)
#define MAIN int main()\
{\
	std::cin.get();\
}
#define LOG(x)
#endif


int main()
{
	LOG("Hello");
	std::cout << "Hello" << std::endl;
	WAIT //可直接呼叫巨集，它的內容可以完全自訂
}

```