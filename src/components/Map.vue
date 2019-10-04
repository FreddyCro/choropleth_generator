<template>
  <div class="color-map-container">
    <section class="color-map-section control-container">
      <div class="control-section">
        <h3>圖層</h3>
        <input type="radio" name="map-layer" disabled /> 全台灣(這份圖資沒有這層)
        <input type="radio" name="map-layer" checked="true" /> 縣市
        <input type="radio" name="map-layer" /> 鄉鎮
      </div>
      <div class="control-section">
        <div class="sub-section">
          <h3>上色方式</h3>
          <input type="radio" name="color-method" checked="true" /> 選縣市->填數字
          <input type="radio" name="color-method" /> 選縣市->填色碼
        </div>
        <h3>資料類型</h3>
        <input type="radio" name="data-type" checked="true" /> Numeric
        <input type="radio" name="data-type" /> Category
      </div>
      <div class="control-section">
        <div class="sub-section">
          <h3>輸入範圍</h3>
          <input type="text" /> min
          <input type="text" /> max
        </div>
        <div class="sub-section">
          <h3>輸入顏色數量</h3>
          <input type="number" value="5" /> (根據格式塔心理學 5~7為佳)
        </div>
        <div class="sub-section">
          <h3>輸入色階<button>展開</button></h3>
          <input type="text" /> color 1
          <input type="text" /> color 2
          <input type="text" /> color 3
        </div>
        <div class="sub-section">
          <h3>色碼</h3>
          <input type="text" />
          <input type="checkbox" /> 縣市名稱
        </div>
      </div>
      <div class="control-section">
        <h3>選縣市<button>展開</button>
        </h3>
        <select>
          <option>台北</option>
          <option>新北</option>
          <option>基隆</option>
        </select>
        <div class="input-group">
          <input type="checkbox" name="area" /> 中正區
        </div>
        <div class="input-group">
          <input type="checkbox" name="area" /> 萬華區
        </div>
        <div class="input-group">
          <input type="checkbox" name="area" /> 大安區
        </div>
        <input type="submit" value="上色" />
        <input type="submit" value="清空選取" />
      </div>
      <div class="control-section">
        <h3>
          輸入資料
          <button>展開</button>
        </h3>
        <textarea name id cols="30" rows="10"></textarea>
        <input type="submit" value="Submit to me" />
      </div>
    </section>
    <section class="color-map-section map-container">
      <div class="map-section map-section-mayor">
        <svg class="map" />
      </div>
      <div class="map-section map-section-minor">
        <h3>樣式</h3>
        <!-- <h1>Choropleth Generator © 2019</h1> -->
      </div>
    </section>
  </div>
</template>

<script>
import * as d3 from 'd3';

export default {
  name: 'D3Map',
  data() {
    return {
      mapConfig: {
        width: '100%',
        height: '100%',
        stroke: '1px',
      },
    };
  },
  methods: {},
  mounted: function() {
    let topojson = require('topojson');

    let mapSvg = d3
      .select('.map')
      .attr('width', this.mapConfig.width)
      .attr('height', this.mapConfig.height);

    let projection = d3
      .geoMercator()
      .center([121.159531, 24.988567])
      .scale(5500);

    let path = d3.geoPath().projection(projection);
    let map = d3.json('./TOWN_MOI_1080726.json');

    map.then(response => {
      let countiesLayerTopo = topojson.feature(
        response,
        response.objects.TOWN_MOI_1080726
      );
      let nodes = countiesLayerTopo.features;

      mapSvg
        .selectAll('path')
        .data(countiesLayerTopo.features)
        .enter()
        .append('path')
        .attr('d', path)
        .attr('class', (d) => {
          return d.properties.COUNTYNAME + ' ' + d.properties.TOWNNAME;
        })
        .style('stroke', 'black')
        .style('fill', 'none');

      // All Taiwan, no counties layer.
      // mapSvg
      //   .append('path')
      //   .datum(topojson.feature(response, response.objects.county))
      //   .attr('d', path)
      //   .style('stroke', 'black')
      //   .style('fill', 'lightgreen')
    });
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
}
.color-map-section {
  border: solid 1px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: flex-start;
  .map-section {
    position: relative;
    width: 100%;
    display: flex;
    justify-content: flex-start;
    align-items: flex-start;
    border: solid 1px;
    padding: 10px;
  }
  .map-section-mayor {
    position: relative;
    height: 80%;
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
  .control-section {
    width: 100%;
    height: 100%;
    border: solid 1px;
    padding: 10px;
  }
}
.map-container {
  position: relative;
  width: 60%;
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
}
</style>

