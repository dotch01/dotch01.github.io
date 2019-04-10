---
layout: post
title:  "C++的多載"
author: dot
categories: [ cpp, programming ]
image: assets/images/16.jpg
toc: false
featured: false
hidden: false
---

多載跟複寫既很像但又不像，要說他們完全沒關係也不行

不過他們有個很重要的共通點就是，能讓你的程式更靈活，特別是在你想要重新定義一個方法的時候

多載(overload)可以讓同一個宣告類型的函式你給他不同的參數輸出不一樣的東西

也可以讓不同宣告類型的函式用不同的參數輸出不一樣的東西

雖然兩種方法都可以使用在C++或其他程式語言中，但最好不要使用後者

想想看你在一家小吃店(class類別)，點了菜單上的東西(function函式)，出來後卻跟你說這樣菜要當成自助餐秤重算錢情況吧

如果你看不懂上面再寫什麼，那很正常，因為當你把後者用在code裡的時候就會發生這種災難

以下寫了個簡單的範例程式來做練習

```c
#include <iostream>

struct Vector2 //定義一個可使用的結構
{
	float x, y;

	Vector2(float x, float y)
		:x(x), y(y) {}

	Vector2 Add(const Vector2& other) const //此函式無法更動變數
	{
		return Vector2(x + other.x, y + other.y);
	}

	Vector2 Multiply(const Vector2& other) const //此函式無法更動變數
	{
		return Vector2(x*other.x, y*other.y);
	}

	Vector2 operator+(const Vector2& other) //定義此結構使用運算子+的時候要做的事
	{
		return Add(other);
	}

	Vector2 operator*(const Vector2& other) //定義此結構使用運算子*的時候要做的事
	{
		return Multiply(other);
	}

	bool operator==(const Vector2& other) const //定義此結構使用運算子==的時候要做的事
	{
		return x == other.x && y == other.y;
	}
	
	bool operator!=(const Vector2& other) const //定義此結構使用運算子!=的時候要做的事
	{
		return !operator==(other);
		//return !(*this == other);
	}
};

std::ostream& operator<<(std::ostream& stream, const Vector2& other) //定義此結構要輸出的值
{
	stream << other.x << ", " << other.y;
	return stream;
}
 
int main()
{
	Vector2 position(4.0f, 4.0f);
	Vector2 speed(0.5f, 1.5f);
	Vector2 powerup(1.1f, 1.1f);

	Vector2 result1 = position.Add(speed.Multiply(powerup)); //result1=result2，1的方法在java中只能這麼做，2看起來相對整潔
	Vector2 result2 = position + speed * powerup; //在結構中定義好算子輸出才能寫成這樣

	if (result1 == result2) //在結構中定義好算子==才能寫成這樣
	{

	}

	std::cout << result2 << std::endl;

	std::cin.get();
}

```