<template>
  <div class="color-map-container">
    <section class="color-map-section control-container">
      <div class="control-section">
        <h3>圖層</h3>
        <!-- <input type="radio" name="map-layer" @change="handleChangeLayer(1)" disabled /> 全台灣 -->
        <input type="radio" name="map-layer" @change="handleChangeLayer(1)" checked="true" /> 縣市
        <input type="radio" name="map-layer" @change="handleChangeLayer(2)" /> 鄉鎮
        <h3>顯示範圍</h3>
        <input type="radio" name="map-visiblity" @change="handleShowAllArea(false)" checked="true" /> 全部
        <input type="radio" name="map-visiblity" @change="handleShowAllArea(true)" /> 選取行政區
        <div v-if="controller.showAllArea" class="area-to-show-selected-container">
          <div
            v-for="(item, index) in Object.keys(this.cityObject)"
            :key="index"
            class="area-to-show-group"
          >
            <input type="checkbox" @change="handleShowSelectedArea(item, $event)" checked="true" />
            {{item}}
          </div>
        </div>
      </div>
      <div class="control-section">
        <div class="sub-section">
          <h3>上色方式</h3>
          <input
            type="radio"
            name="color-method"
            @change="handleChangeDrawingType(1)"
            checked="true"
          /> 微🐈智慧輸入
          <input type="radio" name="color-method" @change="handleChangeDrawingType(2)" /> 輸入色碼
        </div>
        <div class="sub-section">
          <h3>輸入方式</h3>
          <input type="radio" name="input-method" @change="handleChangeInputType(1)" checked="true" /> 選擇器
          <input type="radio" name="input-method" @change="handleChangeInputType(2)" /> 文字檔
        </div>
        <h3>資料類型</h3>
        <input type="radio" name="data-type" @change="handleChangeDataType(1)" checked="true" /> Numeric
        <input type="radio" name="data-type" @change="handleChangeDataType(2)" /> Category
      </div>
      <div class="control-section">
        <button class="control-button fold-button" @click="hanldeSectionFold($event)">展開</button>
        <!-- Numeric -->
        <div v-show="controller.dataType === 1 && controller.drawingType === 1" class="sub-section">
          <div class="sub-section-row">
            <h3>輸入範圍</h3>
            <input
              type="text"
              name="data-range"
              v-model="colorParams.dataRangeMin"
              placeholder="min"
            />
            <input
              type="text"
              name="data-range"
              v-model="colorParams.dataRangeMax"
              placeholder="max"
            />
            <h3>輸入顏色數量</h3>
            <input type="number" name="color-num" min="1" value="5" v-model="colorParams.colorNum" /> (5~7為佳, by Gestalt)
          </div>
          <div class="sub-section-row">
            <h3>輸入色階</h3>
            <input
              v-for="(item, index) in (+colorParams.colorNum)"
              :key="index"
              type="text"
              name="color-code"
              v-model="colorParams.colorScheme[index]"
              placeholder="#fff"
            />
          </div>
        </div>
        <!-- Gategory -->
        <div v-show="controller.dataType === 2 && controller.drawingType === 1" class="sub-section">
          <h3>輸入類別</h3>
          <input type="text" name="data-category" v-model="colorParams.dataCategoryInput" /> (A,B,C)
          <h3>輸入色階</h3>
          <input
            v-for="(item, index) in computeDataCategory"
            :key="index"
            type="text"
            name="color-code"
            v-model="colorParams.colorScheme[index]"
            placeholder="#fff"
          />
        </div>
        <div v-show="controller.drawingType === 2" class="sub-section">
          <h3>色碼</h3>
          <input
            type="text"
            name="specific-color-code"
            v-model="colorParams.specificColor"
            placeholder="#000"
          />
          <button>清除</button>
        </div>
      </div>
      <div v-if="controller.inputType === 1" class="control-section">
        <button class="control-button fold-button" @click="hanldeSectionFold($event)">展開</button>
        <h3>選縣市</h3>
        <select v-if="controller.layer === 2" v-model="onSelectedCity">
          <option
            v-for="(item, index) in computeAreaSelectedList"
            :key="index"
            :value="index"
          >{{index}}</option>
        </select>
        <button class="control-button" name="control-button" @click="drawingColor">上色</button>
        <button class="control-button" name="control-button" @click="handleSelectAllArea">全選</button>
        <button class="control-button" name="control-button">清空選取</button>
        <div class="input-group" v-for="(item, index) in computedAreaOptionList" :key="index">
          <input
            type="checkbox"
            name="area"
            :checked="onSelectedAreaList[index] ? onSelectedAreaList[index].checked : false"
            @change="handleSelectedArea(index, $event)"
          />
          {{item}}
          <input
            v-if="controller.drawingType === 1"
            type="text"
            name="use-color-code"
            :value="onSelectedAreaList[index] ? onSelectedAreaList[index].value : null"
            @change="handleInputUseColor(index, $event)"
            :placeholder="computeUseColorPlaceholder"
          />
        </div>
      </div>
      <div v-if="controller.inputType === 2" class="control-section">
        <button class="control-button fold-button" @click="hanldeSectionFold($event)">展開</button>
        <h3>輸入資料</h3>
        <textarea
          name="data-text-area-input"
          cols="30"
          rows="5"
          v-model="colorParams.dataTextAreaInput"
          placeholder="基隆市仁愛區,20"
        />
        <button name="control-button" @click="drawingColor">上色</button>
      </div>
    </section>
    <section class="color-map-section map-container">
      <div class="map-section map-section-mayor">
        <div class="map-wrapper" :style="computeMapStyle">
          <svg id="map" viewBox="0 0 550 550" />
        </div>
        <div class="map-scale-control-button-container">
          <button class="control-button map-scale-button" @click="hanldeMapScale('+')">+</button>
          <button class="control-button map-scale-button" @click="hanldeMapScale('-')">-</button>
        </div>
        <div class="map-direction-control-button-container">
          <button class="control-button map-direction-button" @click="hanldeMapTranslate('up')">↑</button>
          <button class="control-button map-direction-button" @click="hanldeMapTranslate('down')">↓</button>
          <button class="control-button map-direction-button" @click="hanldeMapTranslate('left')">←</button>
          <button class="control-button map-direction-button" @click="hanldeMapTranslate('right')">→</button>
        </div>
      </div>
      <div class="map-section map-section-minor">
        <h3>樣式</h3>
        <input type="checkbox" name="show-area-name" /> 顯示區域名稱
        <!-- <h1>Choropleth Generator © 2019</h1> -->
      </div>
    </section>
  </div>
</template>

<script>
import * as d3 from "d3";

export default {
  name: "D3Map",
  data() {
    return {
      mapConfig: {
        width: "550px",
        height: "550px",
        stroke: "1px"
      },
      controller: {
        layer: 1,
        dataType: 1,
        showAllArea: false,
        drawingType: 1,
        inputType: 1,
        mapScale: 1,
        mapTranslate: {
          x: 0,
          y: 0
        }
      },
      colorParams: {
        colorNum: 5,
        colorScheme: [],
        specificColor: null,
        dataRangeMin: 0,
        dataRangeMax: 0,
        dataCategoryInput: null,
        dataTextAreaInput: null
      },
      onSelectedCity: null,
      onSelectedAreaList: [],
      cityObject: {
        基隆市: [
          "仁愛區",
          "中正區",
          "信義區",
          "中山區",
          "安樂區",
          "七堵區",
          "暖暖區"
        ],
        台北市: [
          "中山區",
          "大安區",
          "松山區",
          "中正區",
          "信義區",
          "大同區",
          "萬華區",
          "士林區",
          "北投區",
          "內湖區",
          "南港區",
          "文山區"
        ],
        新北市: [
          "新莊區",
          "中和區",
          "樹林區",
          "永和區",
          "五股區",
          "蘆洲區",
          "三峽區",
          "板橋區",
          "土城區",
          "鶯歌區",
          "三重區",
          "五股區",
          "泰山區",
          "林口區",
          "八里區",
          "淡水區",
          "三芝區",
          "石門區",
          "金山區",
          "萬里區",
          "汐止區",
          "瑞芳區",
          "貢寮區",
          "平溪區",
          "雙溪區",
          "新店區",
          "深坑區",
          "坪林區",
          "石碇區",
          "烏來區"
        ],
        桃園市: [
          "中壢區",
          "楊梅區",
          "平鎮區",
          "龜山區",
          "桃園區",
          "龍潭區",
          "大溪區",
          "蘆竹區",
          "八德區",
          "大園區",
          "新屋區",
          "觀音區",
          "復興區"
        ],
        新竹市: ["東區", "香山區", "北區"],
        新竹縣: [
          "竹東鎮",
          "竹北市",
          "寶山鄉",
          "新埔鎮",
          "湖口鄉",
          "橫山鄉",
          "芎林鄉",
          "新豐鄉",
          "關西鎮",
          "北埔鄉",
          "尖石鄉",
          "峨眉鄉",
          "五峰鄉"
        ],
        苗栗縣: [
          "卓蘭鎮",
          "通霄鎮",
          "苗栗市",
          "苑裡鎮",
          "竹南鎮",
          "三義鄉",
          "後龍鎮",
          "大湖鄉",
          "頭份市",
          "銅鑼鄉",
          "公館鄉",
          "泰安鄉",
          "西湖鄉",
          "造橋鄉",
          "頭屋鄉",
          "獅潭鄉",
          "南庄鄉",
          "三灣鄉"
        ],
        台中市: [
          "豐原區",
          "大里區",
          "太平區",
          "東勢區",
          "新社區",
          "神岡區",
          "石岡區",
          "霧峰區",
          "和平區",
          "大肚區",
          "大安區",
          "大甲區",
          "大雅區",
          "沙鹿區",
          "龍井區",
          "梧棲區",
          "清水區",
          "后里區",
          "外埔區",
          "烏日區",
          "潭子區",
          "中區",
          "東區",
          "西區",
          "南區",
          "北區",
          "西屯區",
          "南屯區",
          "北屯區"
        ],
        南投縣: [
          "南投市",
          "埔里鎮",
          "草屯鎮",
          "竹山鎮",
          "集集鎮",
          "名間鄉",
          "鹿谷鄉",
          "中寮鄉",
          "魚池鄉",
          "國姓鄉",
          "水里鄉",
          "信義鄉",
          "仁愛鄉"
        ],
        彰化縣: [
          "彰化市",
          "鹿港鎮",
          "員林市",
          "伸港鄉",
          "和美鎮",
          "線西鄉",
          "田中鎮",
          "花壇鄉",
          "福興鄉",
          "芳苑鄉",
          "大村鄉",
          "社頭鄉",
          "芬園鄉",
          "永靖鄉",
          "秀水鄉",
          "二水鄉",
          "埔心鄉",
          "北斗鎮",
          "埔鹽鄉",
          "溪湖鎮",
          "溪州鄉",
          "二林鎮",
          "田尾鄉",
          "埤頭鄉",
          "竹塘鄉",
          "大城鄉"
        ],
        雲林縣: [
          "斗六市",
          "虎尾鎮",
          "林內鄉",
          "古坑鄉",
          "斗南鎮",
          "莿桐鄉",
          "西螺鎮",
          "北港鎮",
          "水林鄉",
          "麥寮鄉",
          "土庫鎮",
          "大埤鄉",
          "崙背鄉",
          "二崙鄉",
          "元長鄉",
          "四湖鄉",
          "台西鄉",
          "口湖鄉",
          "東勢鄉",
          "褒忠鄉"
        ],
        嘉義市: ["東區", "西區"],
        嘉義縣: [
          "民雄鄉",
          "大林鎮",
          "新港鄉",
          "竹崎鄉",
          "梅山鄉",
          "太保市",
          "水上鄉",
          "中埔鄉",
          "布袋鎮",
          "番路鄉",
          "朴子市",
          "里山鄉",
          "溪口鄉",
          "鹿草鄉",
          "六腳鄉",
          "東石鄉",
          "大埔鄉",
          "義竹鄉",
          "阿里山鄉"
        ],
        台南市: [
          "新營區",
          "後壁區",
          "鹽水區",
          "白河區",
          "柳營區",
          "官田區",
          "學甲區",
          "將軍區",
          "東山區",
          "善化區",
          "北門區",
          "麻豆區",
          "六甲區",
          "佳里區",
          "下營區",
          "七股區",
          "中西區",
          "東區",
          "南區",
          "北區",
          "安平區",
          "安南區",
          "大內區",
          "西港區",
          "新市區",
          "安定區",
          "山上區",
          "玉井區",
          "楠西區",
          "南化區",
          "左鎮區",
          "仁德區",
          "歸仁區",
          "關廟區",
          "龍崎區",
          "永康區",
          "新化區"
        ],
        高雄市: [
          "鹽埕區",
          "鼓山區",
          "左營區",
          "三民區",
          "新興區",
          "前金區",
          "苓雅區",
          "前鎮區",
          "旗津區",
          "小港區",
          "鳳山區",
          "楠梓區",
          "林園區",
          "大寮區",
          "大樹區",
          "大社區",
          "仁武區",
          "鳥松區",
          "岡山區",
          "橋頭區",
          "燕巢區",
          "田寮區",
          "阿蓮區",
          "路竹區",
          "湖內區",
          "茄萣區",
          "永安區",
          "彌陀區",
          "梓官區",
          "旗山區",
          "美濃區",
          "六龜區",
          "甲仙區",
          "杉林區",
          "內門區",
          "茂林區",
          "桃源區",
          "那瑪夏區"
        ],
        屏東縣: [
          "屏東市",
          "潮州鎮",
          "東港鎮",
          "恆春鎮",
          "萬丹鄉",
          "長治鄉",
          "麟洛鄉",
          "九如鄉",
          "里港鄉",
          "鹽埔鄉",
          "高樹鄉",
          "萬巒鄉",
          "內埔鄉",
          "竹田鄉",
          "新埤鄉",
          "枋寮鄉",
          "新園鄉",
          "崁頂鄉",
          "林邊鄉",
          "南州鄉",
          "佳冬鄉",
          "琉球鄉",
          "車城鄉",
          "滿州鄉",
          "枋山鄉",
          "三地門鄉",
          "霧台鄉",
          "瑪家鄉",
          "泰武鄉",
          "來義鄉",
          "春日鄉",
          "獅子鄉",
          "牡丹鄉"
        ],
        宜蘭縣: [
          "宜蘭市",
          "羅東鎮",
          "蘇澳鎮",
          "頭城鎮",
          "礁溪鄉",
          "壯圍鄉",
          "員山鄉",
          "冬山鄉",
          "五結鄉",
          "三星鄉",
          "大同鄉",
          "南澳鄉"
        ],
        花蓮縣: [
          "花蓮市",
          "秀林鄉",
          "吉安鄉",
          "玉里鎮",
          "鳳林鎮",
          "光復鄉",
          "卓溪鄉",
          "瑞穗鄉",
          "萬榮鄉",
          "富里鄉",
          "新城鄉",
          "壽豐鄉",
          "豐濱鄉"
        ],
        台東縣: [
          "長濱鄉",
          "台東市",
          "成功鎮",
          "關山鎮",
          "卑南鄉",
          "大武鄉",
          "太麻里鄉",
          "東河鄉",
          "鹿野鄉",
          "池上鄉",
          "綠島鄉",
          "延平鄉",
          "海端鄉",
          "達仁鄉",
          "金峰鄉",
          "蘭嶼鄉"
        ],
        澎湖縣: ["馬公市", "湖西鄉", "白沙鄉", "西嶼鄉", "望安鄉", "七美鄉"],
        金門縣: ["金城鎮", "金湖鎮", "金沙鎮", "金寧鄉", "烈嶼鄉", "烏坵鄉"],
        連江縣: ["南竿鄉", "北竿鄉", "莒光鄉", "東引鄉"]
      }
    };
  },
  computed: {
    computeAreaSelectedList() {
      if (this.controller.layer === 1) return null;
      if (this.controller.layer === 2) return this.cityObject;
      return null;
    },
    computedAreaOptionList() {
      if (this.controller.layer === 1) return Object.keys(this.cityObject);
      if (this.controller.layer === 2)
        return this.cityObject[this.onSelectedCity];
      return null;
    },
    computeUseColorPlaceholder() {
      if (this.controller.dataType === 2) return "ex: B";
      if (this.controller.drawingType === 1) return "ex: 50";
      else if (this.controller.drawingType === 2) return "ex: 3";
      else return null;
    },
    computeDataCategory() {
      if (this.colorParams.dataCategoryInput)
        return this.colorParams.dataCategoryInput.split(",");
      else return 1;
    },
    computeMapStyle() {
      return {
        transform:
          "scale(" +
          this.controller.mapScale +
          ") translate(" +
          this.controller.mapTranslate.x +
          "%," +
          this.controller.mapTranslate.y +
          "%)"
      };
    }
  },
  watch: {
    onSelectedCity: function() {
      this.onSelectedAreaList = this.cityObject[this.onSelectedCity].map(e => {
        return {
          name: e,
          category: null,
          value: null,
          checked: false
        };
      });
    }
  },
  methods: {
    handleChangeLayer(index) {
      this.controller.layer = index;
      if (index === 1) this.initCountyMap();
      if (index === 2) this.initTownMap();
    },
    handleShowAllArea(boolean) {
      this.controller.showAllArea = boolean;
    },
    handleShowSelectedArea(item, event) {
      if (event.target.checked)
        d3.selectAll("." + item)
          .transition()
          .duration(666)
          .ease(d3.easeCubicIn)
          .style("opacity", 1);
      if (!event.target.checked)
        d3.selectAll("." + item)
          .transition()
          .duration(666)
          .ease(d3.easeCubicIn)
          .style("opacity", 0);
      return null;
    },
    handleChangeDrawingType(index) {
      this.controller.drawingType = index;
    },
    handleChangeDataType(index) {
      // change data type
      this.controller.dataType = index;
      // clear color scheme
      this.colorParams.colorScheme = [];
    },
    handleChangeInputType(index) {
      this.controller.inputType = index;
    },
    hanldeSectionFold: function(event) {},
    handleInputUseColor(index, event) {
      this.onSelectedAreaList[index].value = event.target.value;
    },
    handleSelectedArea(index, event) {
      this.onSelectedAreaList[index].checked = event.target.checked;
    },
    handleSelectAllArea() {
      this.onSelectedAreaList.forEach(e => {
        e.checked = true;
      });
    },
    handleTextAreaInput() {
      this.onSelectedAreaList = [];
      const rawData = this.colorParams.dataTextAreaInput.split("\n");
      rawData.forEach(e => {
        const temp = e.split(",");
        this.onSelectedAreaList.push({
          name: temp[0],
          value: temp[1]
        });
      });
    },
    hanldeMapScale(zoom) {
      if (zoom === "+") this.controller.mapScale += 0.3;
      if (zoom === "-")
        this.controller.mapScale = Math.max(this.controller.mapScale - 0.3, 0);
      return null;
    },
    hanldeMapTranslate(dir) {
      switch (dir) {
        case "up":
          this.controller.mapTranslate.y -= 10; 
          break;
        case "down":
          this.controller.mapTranslate.y += 10; 
          break;
        case "left":
          this.controller.mapTranslate.x += 10; 
          break;
        case "right":
          this.controller.mapTranslate.x -= 10; 
          break;
        default:
          break;
      }
    },
    drawingColor() {
      const mapSvg = d3.select("#map");
      const selectedCity = this.onSelectedCity ? this.onSelectedCity : "";
      switch (this.controller.inputType) {
        // 選擇器
        case 1:
          // 智慧輸入
          if (this.controller.drawingType === 1) {
            // 數值資料
            if (
              this.controller.dataType === 1 &&
              this.colorParams.colorScheme.length > 0
            ) {
              const dataScale = d3
                .scaleQuantize()
                .domain([
                  this.colorParams.dataRangeMin,
                  this.colorParams.dataRangeMax
                ])
                .range(this.colorParams.colorScheme);

              this.onSelectedAreaList.forEach(e => {
                if (e.checked) {
                  mapSvg
                    .select("#" + selectedCity + e.name)
                    .transition()
                    .duration(666)
                    .ease(d3.easeCubicIn)
                    .style("fill", dataScale(e.value));
                }
              });
            }
            // 類別資料
            else if (
              this.controller.dataType === 2 &&
              this.colorParams.colorScheme.length > 0
            ) {
              const dataScale = d3
                .scaleQuantize()
                .domain([0, this.computeDataCategory.length - 1])
                .range(this.colorParams.colorScheme);

              this.onSelectedAreaList.forEach(e => {
                if (e.checked) {
                  mapSvg
                    .select("#" + selectedCity + e.name)
                    .transition()
                    .duration(666)
                    .ease(d3.easeCubicIn)
                    .style(
                      "fill",
                      dataScale(this.computeDataCategory.indexOf(e.value))
                    );
                }
              });
            }
            // 輸入資料有誤
            else {
              alert("error!");
            }
          }
          // 輸入色碼
          else {
            if (this.colorParams.specificColor && this.onSelectedAreaList) {
              this.onSelectedAreaList.forEach(e => {
                if (e.checked) {
                  mapSvg
                    .select("#" + selectedCity + e.name)
                    .transition()
                    .duration(666)
                    .ease(d3.easeCubicIn)
                    .style("fill", this.colorParams.specificColor);
                }
              });
            } else {
              alert("error!");
            }
          }
          break;

        // 文字檔
        case 2:
          // 數值資料
          if (
            this.controller.dataType === 1 &&
            this.colorParams.colorScheme.length > 0
          ) {
            this.handleTextAreaInput();
            const dataScale = d3
              .scaleQuantize()
              .domain([
                this.colorParams.dataRangeMin,
                this.colorParams.dataRangeMax
              ])
              .range(this.colorParams.colorScheme);

            this.onSelectedAreaList.forEach(e => {
              mapSvg
                .select("#" + e.name)
                .transition()
                .duration(666)
                .ease(d3.easeCubicIn)
                .style("fill", dataScale(e.value));
            });
          }
          // 類別資料
          else if (
            this.controller.dataType === 2 &&
            this.colorParams.colorScheme.length > 0
          ) {
            this.handleTextAreaInput();
            const dataScale = d3
              .scaleQuantize()
              .domain([0, this.computeDataCategory.length - 1])
              .range(this.colorParams.colorScheme);

            this.onSelectedAreaList.forEach(e => {
              mapSvg
                .select("#" + e.name)
                .transition()
                .duration(666)
                .ease(d3.easeCubicIn)
                .style(
                  "fill",
                  dataScale(this.computeDataCategory.indexOf(e.value))
                );
            });
          } else {
            alert("error!");
          }
          break;
        default:
          break;
      }
    },
    initCountyMap() {
      // 清空地圖
      d3.selectAll("path").remove();
      // 初始化資料
      this.onSelectedAreaList = Object.keys(this.cityObject).map(e => {
        return {
          name: e,
          category: null,
          value: null,
          checked: false
        };
      });

      let topojson = require("topojson");
      let mapSvg = d3
        .select("#map")
        .attr("width", this.mapConfig.width)
        .attr("height", this.mapConfig.height);

      let projection = d3
        .geoMercator()
        .center([123.5, 24.5])
        .scale(3500);

      let path = d3.geoPath().projection(projection);
      let map = d3.json("./twCounty2010.topo.json");

      map.then(response => {
        let countiesLayerTopo = topojson.feature(
          response,
          response.objects.layer1
        );
        mapSvg
          .append("g")
          .selectAll("path")
          .data(countiesLayerTopo.features)
          .enter()
          .append("path")
          .attr("d", path)
          .attr("class", d => {
            return d.properties.COUNTYNAME;
          })
          .attr("id", d => {
            return d.properties.COUNTYNAME;
          })
          .style("stroke", "black");
      });
    },
    initTownMap() {
      // 清空地圖
      d3.selectAll("path").remove();

      let topojson = require("topojson");
      let mapSvg = d3
        .select("#map")
        .attr("width", this.mapConfig.width)
        .attr("height", this.mapConfig.height);

      let projection = d3
        .geoMercator()
        .center([123.5, 24.5])
        .scale(3500);

      let path = d3.geoPath().projection(projection);
      let map = d3.json("./TOWN_MOI_1080726.json");

      map.then(response => {
        let countiesLayerTopo = topojson.feature(
          response,
          response.objects.TOWN_MOI_1080726
        );

        mapSvg
          .append("g")
          .selectAll("path")
          .data(countiesLayerTopo.features)
          .enter()
          .append("path")
          .attr("d", path)
          .attr("class", d => {
            return d.properties.COUNTYNAME + " " + d.properties.TOWNNAME;
          })
          .attr("id", d => {
            return d.properties.COUNTYNAME + d.properties.TOWNNAME;
          })
          .style("stroke", "black");
      });
    }
  },
  mounted() {
    this.initCountyMap();
  }
};
</script>

<style lang="scss">
.color-map-container {
  position: relative;
  width: 100%;
  height: 100vh;
  display: flex;
  justify-content: center;
  .control-button {
    width: 60px;
    height: 25px;
  }
  .fold-button {
    position: absolute;
    top: 0;
    right: 0;
  }
  .fold-button-map {
    position: absolute;
    top: 0;
    left: 0;
  }
  input[type="checkbox"] {
    width: 15px;
    height: 15px;
  }
  input[type="text"] {
    width: 75px;
  }
}
.color-map-section {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: flex-start;
  padding: 10px 5px;
  .map-section {
    position: relative;
    width: 100%;
    overflow: hidden;
    display: flex;
    justify-content: flex-start;
    align-items: flex-start;
    border: solid 1px;
    padding: 10px;
    margin: 3px 0;
  }
  .map-section-mayor {
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    height: 80%;
    .map-scale-control-button-container {
      position: absolute;
      top: 0;
      right: 0;
    }
    .map-direction-control-button-container {
      position: absolute;
      bottom: 0;
      right: 0;
      display: flex;
      flex-direction: column;
    }
  }
  .map-section-minor {
    position: relative;
    height: 20%;
  }
}
.control-container {
  position: relative;
  width: 40%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: flex-start;
  overflow-y: scroll;
  .control-section {
    position: relative;
    width: 100%;
    height: 100%;
    border: solid 1px;
    padding: 10px;
    margin: 3px 0;
  }
}
.map-container {
  position: relative;
  width: 60%;
  overflow: hidden;
}
.map-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
}
.full-page {
  position: fixed;
  top: 5vh;
  left: 5vh;
  width: 90vh;
  height: 90vh;
}
path {
  stroke-width: 1px;
  fill: #fff;
}
</style>

