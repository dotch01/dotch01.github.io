---
layout: post
title:  "C++的變數"
author: dot
categories: [ c++, programming, note ]
image: assets/images/16.jpg
---

#### C++變數筆記

紀錄一下原本打在Word上的變數筆記

有些註解寫了可以存取的資料類型，沒著名的是除了string以外不拘



```c
int variable = 8; //int 占用4byte memory = 32bits 1byte = 8 bits
unsigned int var = 8; // unsigned 表示可以超出int宣告數地的上限 2百萬

//二進制變數
char; // 1 byte 可用來存取string或int 但只能輸出string
short; //  2 byte 可用來存取string或int 但只能輸出int
long; // 4 byte
long long; // 8 byte

//十進制浮點數變數
float; // 4 byte 可在宣告變數尾端加上 F OR f 跟double區分
double; // 8 byte
long double;

//boolen
bool; // 1 byte
```