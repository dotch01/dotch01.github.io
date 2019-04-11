---
layout: post
title:  "使用C#的TCP/IP實作簡單的訊息傳送"
author: dot
categories: [ Unity, programming ]
tags: [ Unity, TCP IP ]
image: assets/images/16.jpg
beforetoc: "簡單的讓多個Unity輸出檔進行溝通"
toc: true
featured: false
hidden: false
---



#### Introduction



因為某些需求，我們可能會需要在Unity裡利用連線的方式互相傳送一些字串資料，這時候就可以利用C#簡單架設Server端和Client端來做處理

先簡單的介紹一下Server和Client分別是什麼意思和他們的差別吧

* 關於Client

Clinet的直譯叫做客戶端，顧名思義就是**客戶用**，用遊戲來舉例的話，當我們拿起手機，從play商店或是app store下載完一個遊戲後開啟所看到的介面，相信你也猜到了

廣義上來說，那些漂漂亮亮的遊戲畫面就代表Client端

* 關於Server

既然Client端是你所看見的遊戲畫面，那麼Server端呢？

硬要說的話，平常我們是不太可能看到它的，因為它通常只會在公司中看到，但它又與Client的關係卻密不可分

再舉些例子，在遊戲(Client端)裡你應該會常常看到一個東西，叫做聊天室窗

那麼你有沒有想過你從聊天室窗發送出去的文字是如何讓其他玩家或是特定玩家看到的呢？

又或者今天你在遊戲app中課了金要買點數，那麼app要怎麼知道你付了~~撒了~~多少錢給開發商，配給你相對應的點數呢？

簡單的來說，Server端就是在處理這些**在Client端看不到的東西**，雖然你在玩遊戲的時候看不到它，但它卻也非常重要

個人的淺見是認為，Server端就是負責接收Client端傳送過來的資料，並把他們儲存在資料庫中或是傳送到其他地方去。

更簡略的說就是負責資料的輸入和輸出

* C#的TCP/IP

以上就是一些簡單的解說，接下來說說C#的TCP/IP吧

既然要從零開始寫起，首先就得讓Client與Server連結上，但不需要太擔心，在C# Net和.Net的Sockets的函示庫裡，有提供給你TcpClient、TcpListener的類別使用

前者負責處理Client端連線到Server端的IP位址和port接口，後者則是可以在Server端檢查有無Client連線進來

大家可能對於IP位址很熟悉，就是那一串三位數或二位數+上三個點隔開的數字，但port或許就不太熟了

簡單的說port就是由Server開啟的一個虛擬大門，Client只能從這個門進來，要是走錯門就是死路一條囉

而這扇門是由一串數字定義，它的區間最好設定在1024 ~ 65535

再回來TCP/IP，它是基於網路連線上的應用，也就是網路所需的路由器、主機版網路卡等等硬體設備不歸它管，但要使用它就得先具備那些東西

去查查也有可能會看到好幾層什麼什麼層，它是屬於哪一層和哪一層這種概念

看起來好像很複雜，但簡單又概括的說它就是幫助你**檢查Server和Client的狀態和利用網路來讓它們互相傳送資料**的工具

* 加密保護你的訊息

最後在來談一下訊息的加密

做不做這部分主要是要看你的專案大小，或許會有人這麼認為

但我的認為是，只要你的任何資料要在網路上透過不管是app還是網頁傳送，最好通通把它加密

~~不然你傳送的資料就會像一個裸體的人在跑到目的地之前就被路人給看光光~~

至於加密的方式，才要看專案大小來決定，這部分C#裡也有很多種加密演算法供你使用，這邊就先用DES演算法來實作

它是速度很快的一種加解密演算法，但效能高的同時也有比較高的風險會被破解

但由於專案都是有使用時限的展件，就決定先用這個來實作一下簡單的加解密了

它可以設定一個屬於這扇門的鑰匙Key(字串)鑰匙，和一個通關密語IV(字串)，前者可以從Client到Server去設定，後者則是一開始把它寫成類別的時候就去設定好

如果是大專案真的要很多層保護的話，也許可以試試看DES跟AES或搭配其他演算法進行加密(雖然個人是還沒試過)，或者把通關密語用SHA256、md5等等加密後在丟給它們

說了這麼多，來看看在Unity中實作後的程式碼吧

#### Code example

+ Client端

```csharp

using System;
using System.IO;
using System.Net;
using System.Collections;
using System.Net.Sockets;
using System.Collections.Generic;
using UnityEngine;
using UnityEngine.UI;

[AddComponentMenu("TCPIP/Client")]
public class tcpClient : MonoBehaviour 
{
	#region 不須更動的變數
	public GameObject clientUI;
	private bool socketReady;
	private bool pingCheck;
	private float timer;
	private TcpClient socket;
	private NetworkStream stream;
	private StreamWriter writer;
	private StreamReader reader;
	private string host;
	private Text errMsg;
	private GameObject conbtn;
	private Text ip;
	private InputField iptext;
	private int reconnectfrequency;
	
	#if UNITY_ANDROID
	public int port;
	#elif UNITY_STANDALONE_WIN
	private int port;
	#endif

	private const int NotReachable = 0;
	private const int LocalAreaNetwork = 1;
	private const int CarrierDataNetwork = 2;
	private loadMessage loadMsg = new loadMessage();
	[Header ("測試用的輸入設定"), Space(10)]
	public List<KeyCode> input;
	[Header ("要寄出的資料(冒號後的字串會當作判斷的值傳出)"), Space(10)]
	public List<string> sendDataStr;
	[Header ("接收到的資料(判斷只需打入冒號前的字串)"), Space(10)]
	public List<string> receiveDataStr;
	#endregion
	
	private string edKey = "加解密鑰匙" ; //不限中英數字和字數，要和Server填入一樣的內容

	#region 處理Client接收跟發送資料的函式
	private void onIncomingData(string data) //處理Server端寄送過來的資料
	{
		string msg;

		string decrypt_Data = encryptString.DecryptDES(data, edKey); //解密

		foreach (string ms in receiveDataStr)
		{
			if(decrypt_Data.Contains(ms))
			{
				msg = decrypt_Data.Split(':')[1];
				loadMsg.callScriptOrder(msg);
			}
		}

		Debug.Log("Server : " + data);
	}

	private void inputSetting() //輸入設定(測試用預設鍵盤輸入)
	{
		foreach (KeyCode key in input)
		{
			if(Input.GetKeyDown(key))
			{
				string encrypt_Str = encryptString.EncryptDES(sendDataStr[input.IndexOf(key)], edKey); //加密
				Send(encrypt_Str);
			}
		}
	}

	#endregion
	
	///<summary>
	///Client端傳送給Server端訊息
	///</summary>
	/// <param name="data">要傳送的訊息</param>
    /// <returns>有連結到Server會傳送，沒有連結到會跳出訊息</returns>
	public void Send(string data) //寄送資料給Server(需要時可呼叫此函數)
	{
		if(!socketReady) 
		{
			errMsg.text = "沒有連結到Server，無法傳送資料";
			return;
		}

		writer.WriteLine(data);
		writer.Flush();
	}

	#region 不須更動的部分

	private void Update()
	{
		inputSetting();

		if(pingCheck)
		{
			StartCoroutine(PingConnect());
		}

		if(socketReady)
		{
			errMsg.text = "連線成功！";

			if(stream.DataAvailable)
			{
				string data = reader.ReadLine();
				if(data!= null)
				onIncomingData(data);
			}

			if (Application.internetReachability == NetworkReachability.NotReachable)
			{
				errMsg.text = "網路連線不穩，請確認網路連線狀態！";
				socketReady = false;
				pingCheck = true;
			}
		}
	}

	public static int ConnectionStatus() //判斷目前有無連結網路
	{
		int nStatus;

		if(Application.internetReachability == NetworkReachability.NotReachable) // 沒有連線
			nStatus = NotReachable;
		else if(Application.internetReachability == NetworkReachability.ReachableViaLocalAreaNetwork) // Wifi,網路線。
			nStatus = LocalAreaNetwork;
		else if(Application.internetReachability == NetworkReachability.ReachableViaCarrierDataNetwork) // 3G,4G行動網路。
			nStatus = CarrierDataNetwork;
		else
			nStatus = -1;

		return nStatus;
	}

	public void connectBtn()
	{
		if(reconnectfrequency <= 0 && socketReady == false)
		{
			errMsg.text = "正在連結Sever";
			pingCheck = true;
		} else if(reconnectfrequency >= 10)
		{
			reconnectfrequency = 0;
			errMsg.text = "正在重新連結Sever";
			pingCheck = true;
		}

	}

	private IEnumerator PingConnect() //檢查網路ping值，連線or斷線之前後都會先檢查一次再重新連結
	{
		//Google IP
		string googleTW = "203.66.155.50";
		//YahooTW IP
		// string yahooTW = "116.214.12.74";
		//Ping網站
		Ping ping = new Ping(googleTW);

		int nTime = 0;

		while(!ping.isDone){
			yield return new WaitForSeconds(0.1f);

			if(nTime > 20)	// time 2 sec, OverTime
			{
				nTime = 0;
				Debug.Log("連線失敗 : " + ping.time);
				errMsg.text = "網路ping值異常，尚未連結server";
				Debug.Log("ping : " + ping.time);
			}
			nTime++;
		}

		Debug.Log("pingOK");
		errMsg.text = "網路ping值正常，正在嘗試連結server";
		connectIP();
		if(reconnectfrequency >= 10)
		{
			errMsg.text = "請檢查Server有無正確連線後重新連結！";
			conbtn.SetActive(true);
			pingCheck = false;
		} else if(socketReady)
		{
			reconnectfrequency = 0;
			conbtn.SetActive(false);
			pingCheck = false;
		}
		Debug.Log("ping : " + ping.time);
		yield return ping.time;

	}

	private void connectIP() //連線到Server位址
	{
		#if UNITY_STANDALONE_WIN

		ConnectToServer();

		#elif UNITY_ANDROID

		host = iptext.text;
		ConnectToServer();

		#endif
	}

	private void ConnectToServer() //連結到Server
	{
		if (socketReady)
			return;

		try
		{
			socket = new TcpClient(host, port);
			stream = socket.GetStream();
			writer = new StreamWriter(stream);
			reader = new StreamReader(stream);
			socketReady = true;
		}
		catch(Exception e)
		{
			Debug.Log("Socket error : " + e.Message + "     length    ： " + e.Message.Length);
			
			if(e.Message.Length == 48)
			{
				errMsg.text = "連線發生錯誤";
				socketReady = false;
				pingCheck = true;
				return;
			}
			if(e.Message.Length == 18)
			{
				errMsg.text = "連線被拒，重新嘗試連線";
				reconnectfrequency += 1;
				socketReady = false;
				pingCheck = true;
				return;
			}
			if(e.Message.Length == 59)
			{
				errMsg.text = "Server端尚未連線";
				socketReady = false;
				pingCheck = true;
				return;
			}
		}

	}

	private void CloseSocket() //關閉連線
	{
		if(!socketReady)
			return;
		
		writer.Close();
		reader.Close();
		socket.Close();
		socketReady = false;
	}

	private void OnApplicationQuit() //程式結束時離線
	{
		CloseSocket();	
	}

	private void OnDisable() //此腳本被關閉時離線
	{
		CloseSocket();
	}

	private void Start()
	{
		if(GameObject.Find("ClientUICanvas") == null && GameObject.Find("ClientUICanvas(Clone)") == null)
		GameObject.Instantiate(clientUI);

		int nStatus = ConnectionStatus();
		Debug.Log("ConnectionStatus : " + nStatus);
		if( nStatus > 0 )
			Debug.Log("有連線狀態");
		else
			Debug.Log("無連線狀態");

		conbtn = GameObject.Find("conBtn");
		errMsg = GameObject.Find("msg").GetComponent<Text>();
		
		#if UNITY_STANDALONE_WIN

		string path = @"setting.txt";
		conbtn.SetActive(false);
        
        if (File.Exists(path))
        {
            List<string> values = new List<string>(); //記事本定的值(一行為一個值)

            using (StreamReader reader = new StreamReader(path))
            {
                while (reader.EndOfStream == false)//若是檔案還沒讀取完，則繼續讀取
                {
                    string[] str = reader.ReadLine().Split(':');
                    values.Add(str[1]);//一次讀取一行
                }
            }
            
			if (values[0] == "true")
            {
                //設定連線
                Debug.Log(values[0] + values[1] + values[2]);
				host = values[1];
				port = int.Parse(values[2]);
				Destroy(GameObject.Find("IPtextPan"));
				pingCheck = true;
            }
        } else if(File.Exists(path) == false) {
            Debug.Log("根目錄底下沒有 setting.txt 麻煩創建一個記事本哦");
        } else {
			Debug.Log("err");
		}

		#elif UNITY_ANDROID
		pingCheck = false;
		iptext = GameObject.Find("iptext").GetComponent<InputField>();
		ip = GameObject.Find("ip").GetComponent<Text>();
		#endif
	}

	#endregion
}


```

+ Server端

```csharp

using System;
using System.IO;
using System.Net;
using System.Collections;
using System.Net.Sockets;
using System.Collections.Generic;
using UnityEngine;

[AddComponentMenu("TCPIP/Server")]
public class tcpServer : MonoBehaviour {

	#region 不須更動的變數
	private List<ServerClient> clients;
	private List<ServerClient> disconnectList;
	public int port = 5566;
	private TcpListener server;
	private bool serverStarted;
	private string msg;
	private int reconnectfrequency;
	private bool pingCheck;
	private loadMessage loadMsg = new loadMessage();
	[Header ("測試用的輸入設定"), Space(10)]
	public List<KeyCode> input;
	[Header ("要寄出的資料(冒號後的字串會當作判斷的值傳出)"), Space(10)]
	public List<string> sendDataStr;
	[Header ("接收到的資料(判斷只需打入冒號前的字串)"), Space(10)]
	public List<string> receiveDataStr;
	#endregion
	private string edKey = "加解密鑰匙" ; //不限中英數字和字數，要和Client填入一樣的內容

	#region 處理Server接收跟發送資料的函式
	private void onIncomingData(ServerClient c, string data) //處理Client端寄送來的資料
	{
		string decrypt_Data = encryptString.DecryptDES(data, edKey); //解密

		foreach (string ms in receiveDataStr)
		{
			if(decrypt_Data.Contains(ms))
			{
				msg = decrypt_Data.Split(':')[1];
				loadMsg.callScriptOrder(msg);
			}
		}

		Broadcast(c.clientName + " : " + data, clients);
		// Debug.Log(c.clientName + "has sent the following message : " + data);
	}

	private void inputSetting() //輸入設定(測試用預設鍵盤輸入)
	{
		foreach (KeyCode key in input)
		{
			if(Input.GetKeyDown(key))
			{
				string encrypt_Str = encryptString.EncryptDES(sendDataStr[input.IndexOf(key)], edKey); //加密
				Broadcast(encrypt_Str, clients);
			}
		}
	}
	#endregion

	#region 不須更動的函式
	private void Awake()
	{
		clients = new List<ServerClient>();
		disconnectList = new List<ServerClient>();

		try 
		{
			server = new TcpListener(IPAddress.Any, port);
			server.Start();

			startListening();
			serverStarted = true;
			Debug.Log("Server has been started on port" + port.ToString());
		}	
		catch (Exception e) 
		{
			Debug.Log("Socket error:" + e.Message);
			serverStarted = false;
		}
	}

	private void Update() 
	{
		inputSetting();

		if(!serverStarted)
		{
			StartCoroutine(PingConnect());
			return;
		}

		foreach (ServerClient c in clients)
		{
			if(!isConnected(c.tcp))
			{
				c.tcp.Close();
				disconnectList.Add(c);
				continue;
			}
			else
			{
				NetworkStream s = c.tcp.GetStream();
				if(s.DataAvailable)
				{
					StreamReader reader = new StreamReader(s, true);
					string data = reader.ReadLine();

					if(data != null)
					onIncomingData(c, data);
				}
			}
		}

		for(int i = 0; i < disconnectList.Count - 1; i++)
		{
			clients.Remove(disconnectList[i]);
			disconnectList.RemoveAt(i);

			Debug.Log(disconnectList[i].clientName + " has disconnected " + disconnectList.Count);
		}
		
	}

	private IEnumerator PingConnect() //檢查網路ping值，連線or斷線之前後都會先檢查一次再重新連結
	{
		//Google IP
		string googleTW = "203.66.155.50";

		//Ping網站
		Ping ping = new Ping(googleTW);

		int nTime = 0;

		while(!ping.isDone){
			yield return new WaitForSeconds(0.1f);

			if(nTime > 20)	// time 2 sec, OverTime
			{
				nTime = 0;
				Debug.Log("連線失敗 : " + ping.time);
				Debug.Log("ping : " + ping.time);
			}
			nTime++;
		}

		Debug.Log("pingOK");
		Awake();
		if(reconnectfrequency >= 10)
		{
			pingCheck = false;
		} else if(serverStarted)
		{
			pingCheck = false;
		}
		Debug.Log("ping : " + ping.time);
		yield return ping.time;

	}


	private void startListening() //開始監聽
	{
		server.BeginAcceptTcpClient(acceptTcpClient,server);
	}

	private bool isConnected(TcpClient c) //Server連結
	{
		try 
		{
			if(c != null && c.Client != null && c.Client.Connected)
			{
				if(c.Client.Poll(0,SelectMode.SelectRead))
				{
					return !(c.Client.Receive(new byte[1], SocketFlags.Peek) == 0);
				}
				
				return true;
			}
			else
			{
				return false;
			}
		}
		catch 
		{
			return false;
		}
	}
	
	private void acceptTcpClient(IAsyncResult ar) //接受Client端連結
	{
		TcpListener listener = (TcpListener)ar.AsyncState;

		clients.Add(new ServerClient(listener.EndAcceptTcpClient(ar)));
		startListening();

		// Broadcast(clients[clients.Count - 1].clientName + "has connected" , clients);
		Broadcast("%NAME", new List<ServerClient>() { clients[clients.Count - 1]});
	}

	private void OnApplicationQuit() 
	{
		Broadcast("shutdown:8" , clients);
	}
	#endregion
	
	#region Server傳送訊息函式
	///<summary>
	///Server端統一傳送給每個Client端訊息
	///</summary>
	/// <param name="data">要傳送的訊息</param>
    /// <param name="cl">連線進來的Client</param>
    /// <returns>傳送成功返回傳送的字串，失敗返回送給哪個Client發生的錯誤</returns>
	public void Broadcast(string data, List<ServerClient> cl) //從Server端統一傳送給每個Client端訊息(需要時可呼叫此函數)
	{
		foreach (ServerClient c in cl)
		{
			try
			{
				StreamWriter writer = new StreamWriter(c.tcp.GetStream());
				writer.WriteLine(data);
				writer.Flush();
			}
			catch(Exception e)
			{
				Debug.Log("Write error : " + e.Message + "to client" + c.clientName);
			}
		}
	}

	///<summary>
	///Server端統傳送給指定Client端訊息
	///</summary>
	/// <param name="data">要傳送的訊息</param>
    /// <param name="cl">指定的Client，用List返回在變數後面+上"變數[第幾個連線者]"</param>
    /// <returns>傳送成功返回傳送的字串，失敗返回傳到Client發生的錯誤</returns>
	public void assignBroadcast(string data, ServerClient cl) //從Server端傳送給指定Client端訊息(需要時可呼叫此函數)
	{
		try
		{
			StreamWriter writer = new StreamWriter(cl.tcp.GetStream());
			writer.WriteLine(data);
			writer.Flush();
		}
		catch(Exception e)
		{
			Debug.Log("Write error : " + e.Message + "to client" + cl.clientName);
		}
	}
	#endregion

}

public class ServerClient //初始化連線進來的Client
{
	public TcpClient tcp;
	public string clientName;

	public ServerClient(TcpClient clientSocket)
	{
		clientName = "Guest";
		tcp = clientSocket;
	}
}


```

+ 接收訊息後該做什麼回應的DataBase

```csharp

using UnityEngine;

public class loadMessage {

	public int order = 0; //如需要有順序的表演可使用此變數判斷每個client發出指令的次數

	public string callScriptOrder(string orderString) //處理資料後執行要求的事件
    {
        if(orderString == "0")
        {
            Debug.Log("收到訊息0ㄌ");
            return "0";
        }
        else if (orderString == "1")
        {
            Debug.Log("收到訊息1ㄌ");
            return "1";
        }
        else if (orderString == "2")
        {
            Debug.Log("收到訊息2ㄌ");
            return "2";
        }
        else if (orderString == "3")
        {
            Debug.Log("收到訊息3ㄌ");
            return "3";

        }
        else if (orderString == "4")
        {
            Debug.Log("收到訊息4ㄌ");
            return "4";

        } 
		else if (orderString == "5")
        {
            Debug.Log("全體client廣播測試");
            return "5";

        }
        else if (orderString == "6")
        {
            Debug.Log("單獨client廣播測試");
            return "6";

        }
		else if(orderString == "7")
        {
            Debug.Log("工作第" + order + "次了");
            return "work" + order.ToString();
        }

        return null;
        
    }
}


```

+ 使用DES寫個訊息加解密class

```csharp

using System;
using System.IO;
using System.Text;
using System.Security.Cryptography;

public class encryptString
{
    //預設金鑰向量
    //private static byte[] Keys = { 0x12, 0x34, 0x56, 0x78, 0x90, 0xAB, 0xCD, 0xEF };

    //預設金鑰向量(填入8個16進位參數)
    private static byte[] salt = { 0x15, 0x36, 0x86, 0x08, 0x50, 0xC0, 0xBC, 0x2B };

    //IV設定，不限中英數字和字數
    private static string rkeys = "哈囉";

    /// <summary>
    /// DES加密字串
    /// </summary>
    /// <param name="encryptString">待加密的字串</param>
    /// <param name="encryptKey">加密金鑰,不限字數中英數字皆可</param>
    /// <returns>加密成功返回加密後的字串，失敗返回源串</returns>
    public static string EncryptDES(string encryptString, string encryptKey)
    {
        try
        {
            // byte[] rgbKey = Encoding.UTF8.GetBytes(encryptKey.Substring(0, 8));
            // byte[] rgbIV = Keys;
            byte[] inputByteArray = Encoding.UTF8.GetBytes(encryptString);

            byte[] key = Encoding.UTF8.GetBytes(encryptKey);
            Rfc2898DeriveBytes rfcKey = new Rfc2898DeriveBytes(key, salt, 8);
            Rfc2898DeriveBytes rfcIv = new Rfc2898DeriveBytes(rkeys, salt, 8);
            byte[] keyData = rfcKey.GetBytes(8);
            byte[] IVData = rfcIv.GetBytes(8);

            DESCryptoServiceProvider dCSP = new DESCryptoServiceProvider();
            MemoryStream mStream = new MemoryStream();
            CryptoStream cStream = new CryptoStream(mStream, dCSP.CreateEncryptor(keyData, IVData), CryptoStreamMode.Write);
            cStream.Write(inputByteArray, 0, inputByteArray.Length);
            cStream.FlushFinalBlock();
            return Convert.ToBase64String(mStream.ToArray());
        }
        catch
        {
            return encryptString;
        }
    }

    /// <summary>
    /// DES解密字串
    /// </summary>
    /// <param name="decryptString">待解密的字串</param>
    /// <param name="decryptKey">解密金鑰,和加密金鑰相同</param>
    /// <returns>解密成功返回解密後的字串，失敗返源串</returns>
    public static string DecryptDES(string decryptString, string decryptKey)
    {
        try
        {
            byte[] inputByteArray = Convert.FromBase64String(decryptString);

            byte[] key = Encoding.UTF8.GetBytes(decryptKey);
            Rfc2898DeriveBytes rfcKey = new Rfc2898DeriveBytes(key, salt, 8);
            Rfc2898DeriveBytes rfcIv = new Rfc2898DeriveBytes(rkeys, salt, 8);
            byte[] keyData = rfcKey.GetBytes(8);
            byte[] IVData = rfcIv.GetBytes(8);

            DESCryptoServiceProvider DCSP = new DESCryptoServiceProvider();
            MemoryStream mStream = new MemoryStream();
            CryptoStream cStream = new CryptoStream(mStream, DCSP.CreateDecryptor(keyData, IVData), CryptoStreamMode.Write);
            cStream.Write(inputByteArray, 0, inputByteArray.Length);
            cStream.FlushFinalBlock();
            return Encoding.UTF8.GetString(mStream.ToArray());
        }
        catch
        {
            return decryptString;
        }
    }
}


```

#### Summary

Server的流程大概是

<div class="postimg"><img src="https://live.staticflickr.com/7829/47562665311_61fda94c9b_o.png" alt="server"></div>

Client的流程圖大概是

<div class="postimg"><img src="https://live.staticflickr.com/7818/46838831594_9a6829ddc0_o.png" alt="client"></div>

基本上是由電腦當Server端，Client端可輸出到WIN電腦和Android系統，記得將tcpClient跟tcpServer掛到Unity場景的物件上就可以使用囉