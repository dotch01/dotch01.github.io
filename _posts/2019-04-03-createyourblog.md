---
layout: post
title:  "使用github + jekyll創建你的Blog"
author: dot
categories: [ github, git page ]
tags: [ github, jekyll ]
image: assets/images/16.jpg
beforetoc: "紀錄一下使用git page建立Blog成功的作法和一些問題的解決方法"
toc: true
featured: true
hidden: true
rating: 5
---


#### Github signup

- 註冊帳密

github就像一個非常好用的雲端硬碟，除了儲存檔案之外他還能幫你做到控管檔案的版本，甚至備份但這邊就不多說了，直接進入正題。

<a href="https://github.com/join?source=header-home">按這裡<a>輸入暱稱、郵件、密碼註冊完畢後記得要驗證你的電子郵件。

- 建立資源庫

建立資源庫就像是建立一個雲端資料夾，你可以把一個專案甚至是一個還未完成的美術作品上傳到上面進行備份和版本控管

這裡我們需要給部落格一個存在雲端上管理的空間

點選Your respository 按下 New 到新增介面後記住 **Repository name一定要是 帳號名.github.io** 後面的設定基本上不需要更動直接按下 Create repository



#### Install tools

- 安裝VScode

為了管理我們的部落格，你會需要基本資料設定、建立文章、調整版面等等，想要輕鬆地做好這些，你會需要一個好的編輯器，個人推薦VScode，最主要的原因就是因為它輕巧又是免費還能自訂版面，不僅限個人使用，在企業裡做網頁設計的時候也很方便。

<a href="https://code.visualstudio.com/">下載Vscode<a>

安裝完成並開啟它後，你如果想要換成中文介面的話就如圖所示去左邊選擇擴充套件搜尋語言包後點選下載(英文應該是install)並重新啟動後應該就會是中文介面囉。

- 安裝 github desktop

後期發布網站的階段它會非常有用，我們先<a href="https://desktop.github.com/">下載<a>並安裝起來吧，放心後面會再提到它的。

- 安裝Ruby

jekyll是由Ruby開發的部落格網站生產器，只要安裝它就能有各式各樣的免費模板供你使用，首先讓我們從安裝Ruby開始吧
因為個人使用的是win10環境，接下來就只說明win10的部分

Ruby在windows上的安裝方法似乎跟Mac、Linux不一樣，可以使用RubyInstallers直接安裝
首先<a href="https://rubyinstaller.org/downloads/">按這裡<a>個人是選擇WITH DEVKIT的2.6.1-1版本下載，下在完畢後安裝設定預設直接同意過去最後也不要變更選項直接按"Finish"結束安裝。

然後正常情況下你就會看到一個~~疑似木馬程式~~黑色框框，大概是Ruby自己寫的一個終端機，別擔心它只是要安裝一些額外的東西就按下Enter給它安裝就對了
就算沒看到也沒關係，找到你的C槽路徑 Users\"你的使用者名稱"\AppData\Roaming\Microsoft\Windows\Start Menu\Programs\Ruby 2.6.1-1-x64 下會有一個 Start Command Prompt with Ruby 這個東東會很常用到建議你把它釘選在工作列，在找不到就按下Ctrl+F貼上名字用搜尋大法直接暴力搜就好。

開啟之後輸入
```sh
ridk inatall
```
按下Enter就會開始下載安裝了

**補充**

如果你發現黑色框框一直顯示大大的紅字Failed就把它關掉自己去網站下載它需要的東西
<a href="http://www.msys2.org/">按這裡<a>選擇中間x86_64的版本下載並安裝

之後啟動它並在那個黑色框框中輸入 pacman -Syu 並確定安裝後等它跑完

在開啟 Start Command Prompt with Ruby 輸入 ridk install 就可以開始安裝ruby需要的組件了

- 下載jekyll部落格模板

<a href="https://jekyllthemes.io/">按這裡<a>可以選擇想要的模板請注意**會有需要付費的模板**

下載後，盡量將壓縮檔放到C槽或D槽跟目錄下，路徑建議越短越好。

- 終端機的指令

因為我們要使用到的套件是Ruby開發出來的jekyll，就得在另外安裝它
首先開啟 Start Command Prompt with Ruby 以下簡稱終端機，輸入

安裝jekyll套件
```sh
gem install jekyll
```

cd指令是終端機指令，它的後面加上C:\名稱\......\...\ 等就可以讓終端機進到指定的資料夾，這裡就先進到之前下載網頁模板的資料夾位置，路徑建議越短越好。

一開始終端機所指向的路經都會是C:\Users\使用者名稱，你想要移動到哪個資料夾就把路徑+在cd後面就好
```sh
cd 資料夾位置
```

使用jekyll建立並初始化一個基礎Blog，這邊只是要測試你安裝的jekyll套件有沒有運作成功，後面我們會再談到模板的使用
```sh
jekyll new 你的資料夾名稱
```

如果你想要先測試jekyll的基礎Blog能不能正確運行就先在終端機打入
```sh
jekyll serve
```
開啟一個瀏覽器輸入localhost:4000或127.0.0.1:4000如果有頁面跑出來，恭喜你，那代表你已經成功建立了你的部落格，也可以開始寫一些自己的東西了，到這邊已經成功了一半



#### Use jekyll template

還記得我們在<a href="https://jekyllthemes.io/">這裡<a>挑選並下載的部落格模板嗎？

讓我們開啟終端機讓它進到你所下載的網頁模板資料夾根目錄位置
```sh
cd 資料夾位置
```

先來讓我們檢查一下該安裝的東西能不能在這個目錄下運作
```sh
ruby -v
gem -v
jekyll -v
```
如果它們都有回應你一行版本號或名稱+後面一大串數字的話就是都有正常安裝囉

接著我們需要下載這個模板所需要使用到的套件，因此我們輸入
```sh
bundle install
```

然後輸入
```sh
bundle exec jekyll server
```
**注意這邊如過有被防毒軟體擋掉的話記得把它擋掉的檔案放到例外，不然你在本地測試會看不到你的網站**

這時候再從瀏覽器輸入localhost:4000，通常情況下你就能看到剛剛挑選好的精美模板了，同時也代表你可以開始客製化屬於你自己的網頁跟發布貼文了。

不過這都還是本地的測試階段，接下來我們還要讓你的部落格變成真正可以讓人瀏覽的網頁



#### Use github desktop upload your blog

我們開啟~~被邊緣很久的~~github desktop

登入後選擇你要複製到本地的專案，這邊當然是選擇你一開始創建好的 用戶名.github.io

選擇本地路徑後進到下一步

看到這個畫面就是你快成功了

我們在回到之前下載模板的資料夾根目錄，並把裡面的檔案全部複製起來貼到你剛剛設定的本地路徑

這時在回到github desktop左上的區塊可以看到你在這個資料夾中新增了哪些檔案，左下的區塊可以大概紀錄一下這次你更新了些什麼(它可以不重要也可以很重要但它一定要填)，右邊的區塊則是可以看你這次在那些檔案裡增加、減少了什麼，輸入完後按下下面的commit你會看到右上角變成了push，它就是代表你要把檔案傳到剛剛創建好的資源庫啦，按下等它上傳完畢後，開啟瀏覽器視窗輸入 **https://你的用戶名.github.io** 就可以成功看到你的網頁囉，這個網址就是你以後部落格的地址了，是聽說過它是可以變更的，不過這裡就不多說了。



#### Use VScode edit your blog

在<a href="https://jekyllthemes.io/">jekyllthemes<a>能看到的模板有千千萬萬種，但一些基本的功能作法大致上是差不多的，這邊就對幾個基本會改到的部分做一下說明

首先開啟VScode選擇右上角檔案>開啟資料夾，選擇你在上一個步驟設定的本地路徑

下圖的這幾個圈起來的部分

posts資料夾基本上就是你貼文檔案要放的位置， **X-X-X-文章名稱** X的內容建議是跟著照年月日打，沒意外它是會顯示在你貼文上的日期，而最後的文章名稱記得 **千萬不要打中文** 不然99%機率會讓你的網站在測試階段就壞掉。

_config.yml檔案很重要，它並不好解釋，因為在裡面可能會有讓你設定大到管理者、部落格名稱、小到首頁後綴網址、Logo圖片路徑等等，這也可能是我用的模板才有這些設定提供給你使用，但當你要使用一個新模板時一些初始設定一定是從這邊更改的。

assets裡的css就是能修改版面很重要的檔案拉，至於css的語法就不多說了，images通常是你要放入圖片給你部落格引用的路徑。

可能有些網站的資料結構不是長這樣，不過基本上都大同小異，就當參考看看吧。
