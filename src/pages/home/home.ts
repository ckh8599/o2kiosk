import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';

import { Item } from '../../properties/Item';
import { SeletedItem } from '../../properties/SeletedItem';

import { setWsHeartbeat } from "ws-heartbeat/client";

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  item: Item;
  items: Array<Item>;

  seletedItem: SeletedItem;
  seletedItems: Array<SeletedItem>;

  totalCnt: number;
  totalPrice: number;

  btnCreditDisabled: string;
  btnEbDisabled: string;

  constructor(public navCtrl: NavController) {

    this.items = new Array<Item>();
    this.seletedItems = new Array<SeletedItem>();
    this.totalCnt = 0;
    this.totalPrice = 0;

    this.item = new Item();
    this.item.kind = "COF";
    this.item.id = "1";
    this.item.title = "아메리카노";
    this.item.price = 3000;
    this.item.img = "/assets/brand/PAS1.jpg";
    this.item.select = "";
    
    this.items.push(this.item);

    this.item = new Item();
    this.item.kind = "COF";
    this.item.id = "2";
    this.item.title = "카페라떼";
    this.item.price = 4000;
    this.item.img = "/assets/brand/PAS2.jpg";
    this.item.select = "";
    
    this.items.push(this.item);

    this.item = new Item();
    this.item.kind = "COF";
    this.item.id = "3";
    this.item.title = "카라멜 마키아또";
    this.item.price = 5000;
    this.item.img = "/assets/brand/PAS3.jpg";
    this.item.select = "";
    
    this.items.push(this.item);

    this.item = new Item();
    this.item.kind = "COF";
    this.item.id = "4";
    this.item.title = "에스프레쏘";
    this.item.price = 3500;
    this.item.img = "/assets/brand/PAS4.jpg";
    this.item.select = "";
    
    this.items.push(this.item);

    console.log(this.items.length);




    /*
    this.item = new Item();
    this.item.kind = "BEB";
    this.item.id = "10";
    this.item.title = "대추차";
    this.item.price = 3000;
    this.item.img = "/assets/brand/PAS1.jpg";
    this.item.select = "";
    
    this.items.push(this.item);

    this.item = new Item();
    this.item.kind = "BEB";
    this.item.id = "20";
    this.item.title = "설록차";
    this.item.price = 4000;
    this.item.img = "/assets/brand/PAS2.jpg";
    this.item.select = "";
    
    this.items.push(this.item);

    this.item = new Item();
    this.item.kind = "BEB";
    this.item.id = "30";
    this.item.title = "감귤녹차";
    this.item.price = 5000;
    this.item.img = "/assets/brand/PAS3.jpg";
    this.item.select = "";
    
    this.items.push(this.item);

    this.item = new Item();
    this.item.kind = "BEB";
    this.item.id = "40";
    this.item.title = "올리브차";
    this.item.price = 3500;
    this.item.img = "/assets/brand/PAS4.jpg";
    this.item.select = "";
    
    this.items.push(this.item);

    console.log(this.items.length);
    */

    //웹소켓 오픈
    this.openWebsocket();

    //결제요청 버튼상태 초기화
    this.btnCreditDisabled = "";
    this.btnEbDisabled = "";
  }

  //메뉴를 선택하여 사이드 장바구니에 추가
  selectMenu(selitem){

    this.items.forEach(item => {
      item.select = "";
    });
    selitem.select = "select";

    let alreadySeleted: boolean = false;
    this.seletedItems.forEach(selectedItem =>{
      if(selectedItem.id == selitem.id){
        alreadySeleted = true;
      }
    });

    if(!alreadySeleted){
      this.seletedItem = new SeletedItem();
      this.seletedItem.id = selitem.id;
      this.seletedItem.title = selitem.title;
      this.seletedItem.count = 1;
      this.seletedItem.price = selitem.price;
      
      this.seletedItems.push(this.seletedItem);

      this.setCntPrice();
    }
  }

  //전체취소
  emptySeleted(){
    this.seletedItems.splice(0);
    this.setCntPrice();
  }

  //갯수 더하기
  addCount(selitem){
    selitem.count = selitem.count + 1;
    this.setCntPrice();
  }

  //갯수 빼기
  minCount(selitem){
    if(selitem.count > 0){
      selitem.count = selitem.count - 1;
      this.setCntPrice();
    }
    
  }

  //선택한 아이템 제거
  dropItem(index){
    this.seletedItems.splice(index,1);
    this.setCntPrice();
  }

  //총 주문 계산
  private setCntPrice(){
    let tc: number = 0;
    let tp: number = 0;

    this.seletedItems.forEach(selectedItem =>{
      tc = tc + selectedItem.count;
      tp = tp + (selectedItem.price * selectedItem.count);
    });

    this.totalCnt = tc;
    this.totalPrice = tp;
  }

  //신용카드 결제
  payCredit(){
    //인터넷미연결 시 알림
    if(!navigator.onLine){
      alert("인터넷 연결상태 불량");
      return;
    }

    //주문내역 없을 경우
    if(this.seletedItems.length <= 0){
      alert("주문내역 없음");
      return;
    }
    
    //전송정보 입력
    let sendVal = {
      "id" : "ADMIN",
      "param" : {
        "type" : "ORDER",
        "items" : this.seletedItems
      }
    };
    //console.log(JSON.stringify(sendVal));
    let sendJSON = JSON.stringify(sendVal);
    
    //전송 전 요청버튼 비활성화 처리
    this.btnCreditDisabled = "disabled";
    this.btnEbDisabled = "disabled";

    //전송 (웹소켓 미연결 시 연결시도 후 전송처리)
    if(this.webSocket.readyState == this.webSocket.OPEN){
      this.webSocket.send(sendJSON);
    }else{
      console.log("재연결 시도중...");
      this.reopenAndSend(sendJSON);
    }
  }

  //이비 결제
  payEb(){
    console.info(this.seletedItems);
  }
  
  //WebSocket 오픈
  webSocket : WebSocket;
  openWebsocket(){
    this.webSocket = new WebSocket("ws://110.45.199.181:8002/WS?token=MY_STORE&id=KIOSK_01");
    
    //웹소켓 연결시간에 일정시간 이상 소요되면 연결끊기
    this.connectionTimeOut();

    this.webSocket.onopen = function(event){
      console.log("["+ event.type +"] connected!");
    }

    this.webSocket.onclose = (event) => {
      console.log("["+ event.type +"] disconnected!");

      //5초 후 자동 재연결시도 (실패시 다시 호출되므로 5초에 한번씩 연결시도함.)
      setTimeout(() => {
        this.openWebsocket();
      }, 5000);
    }

    this.webSocket.onerror = function(event){
      console.log("["+ event.type +"] failed!");
    }

    this.webSocket.onmessage = (event) => {
      console.log("["+ event.type +"] " + event.data);

      let data = JSON.parse(event.data);
      
      //ping-pong이 아닌 요청완료일 경우 (성공&오류 포함)
      if(data.code != "100"){
        //완료 후 요청버튼 초기화
        this.btnCreditDisabled = "";
        this.btnEbDisabled = "";
      }

      //데이터처리
      if(data.code == "0"){
        //성공
        alert("주문완료");

        //주문내역 초기화
        this.emptySeleted();
        this.items.forEach(item => {
          item.select = "";
        });
      }else if(data.code == "100"){
        //pong 반환완료
        return;
      }else{
        //에러
        alert(data.msg);
        return;
      }
    }
    
    //ping-pong
    setWsHeartbeat(this.webSocket, "ping", {
      pingTimeout: 60000, // 60초동안 서버로부터 응답이 없으면 연결종료 처리
      pingInterval: 30000 // 매 30초마다 ping 메시지를 서버에 전송
    });
  }

  //웹소켓 재오픈 및 전송
  async reopenAndSend(sendJSON){
    //웹소켓 ping-pong으로 5초에 한번씩 웹소켓 오픈 요청중이므로 주석처리
    //웹소켓 오픈
    //this.openWebsocket();

    //연결후 바로 전송 시 연결중 상태로 전송이 도지 않으므로 연결이 완료될때까지 기다림.
    let pendingTime = 0;
    while(this.webSocket.readyState != WebSocket.OPEN){
      await this.sleep(1);
      ++pendingTime;
    }
    console.log("재연결 완료 : " + pendingTime + "밀리세컨트 걸림.");
    
    //전송처리
    this.webSocket.send(sendJSON);
  }

  //대기상태
  sleep(time){
    return new Promise(resolve => setTimeout(resolve, time));
  }

  //웹소켓 연결시간 초과확인 (10초)
  async connectionTimeOut() {
    let time = 0;
    let interval = setInterval(() => {
      if(this.webSocket.readyState == WebSocket.CONNECTING){
        ++time;
        console.log(time);

        if(time > 10){
          console.log("over 10 sec!");
          if(this.webSocket.readyState == WebSocket.CONNECTING){
            this.webSocket.close();
          }
          clearInterval(interval); 
        }
      }else{
        clearInterval(interval);
      }
    }, 1000);
  }
}