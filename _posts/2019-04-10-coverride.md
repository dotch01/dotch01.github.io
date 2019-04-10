---
layout: post
title:  "C++的虛擬函式和複寫"
author: dot
categories: [ cpp, programming ]
image: assets/images/16.jpg
toc: false
featured: false
hidden: false
---

複寫的運用可以讓程式變得更加靈活

個人理解為它跟多載的運用很類似但又不相同，他們的差別在於

複寫可以讓同一個宣告類型的函式輸出不一樣的東西

多載可以讓不同的宣告類型函式輸出不一樣的東西

複寫(override)就像有著同名稱菜色但不同人開的小吃店，讓你在每家店跟他們各自的廚師(不同class)點同一樣菜(同樣名稱的function)

最後每間店的廚師(class)再把他們店跟其他家店名稱相同(同樣名稱和宣告類型的function)但味道有些許差異的菜端上桌(output不同結果)

為了使用它，也為了程式的可讀性，我們需要對**要被複寫的函式**及**複寫的函式**進行標註

virtual 需要寫在**要被複寫的函式**前面
override 則寫在**複寫的函式**的大括號前、小括號後，表示覆寫了原本同名的函式

以下寫了個簡單的範例程式來做練習

```cs
#include <iostream>
#include <string>

class Printable
{
public:
	virtual std::string GetClassName() = 0;
};

class Entity : public Printable
{
public:
	virtual std::string GetName() { return "Entity"; }
	std::string GetClassName() override { return "Entity"; }
};

class Player : public Entity//Player類別繼承Entity類別包含的所有public變數和函式
{
private:
	std::string m_Name;
public:
	Player(const std::string& name)
		:m_Name(name) {}

	std::string GetName() override { return m_Name; }
	std::string GetClassName() override { return "Player"; }
};

void PrintName(Entity* entity)
{
	std::cout << entity->GetName() << std::endl;
}

void Print(Printable* obj)
{
	std::cout << obj->GetClassName() << std::endl;
}

int main()
{
	Entity* e = new Entity();
	PrintName(e);

	Player* p = new Player("me");
	PrintName(p);

	std::cin.get();
}
```

**補充**

如果是要表明該函式不可以被複寫，就要把

final 寫在**不想被複寫的函式**的大括號前、小括號後
