import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';

import { Item } from '../../properties/Item';
import { SeletedItem } from '../../properties/SeletedItem';

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

  //신용카드계산
  payment(){
    if(this.seletedItems.length <= 0){
      alert("주문내역 없음");
      return;
    }

    let sendVal = new Array;
    sendVal.push({
      "id" : "ADMIN",
      "param" : this.seletedItems
    });
    console.log(JSON.stringify(sendVal));
    
    //전송
    this.webSocket.send(JSON.stringify(sendVal));

    alert("주문완료");
    
    //주문내역 초기화
    this.emptySeleted();
    this.items.forEach(item => {
      item.select = "";
    });
  }

  //WebSocket 오픈
  webSocket : WebSocket;
  openWebsocket(){
    this.webSocket  = new WebSocket("ws://110.45.199.181:8002/WS?token=MY_STORE&id=KIOSK_01");
    
    this.webSocket.onopen = function(message){
      console.log("===== OPEN =====");
    }

    this.webSocket.onclose = function(message){
      console.log("===== CLOSE =====");
    }

    this.webSocket.onerror = function(message){
      console.log("!!!!! Error !!!!!");
    }

    this.webSocket.onmessage = function(message){
      console.log("receive data : " + message.data);
    }
  }

}