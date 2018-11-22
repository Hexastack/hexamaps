<template>
  <div id="dm-app">
    <choropleth
      descriminator="WB_A3"
    />
  </div>
</template>

<script>
import Choropleth from './Choropleth'
export default {
  name: 'Index',
  components: {
    Choropleth
  }
}
</script>

<style>
.dm-map {
  width: 960px;
  height: 602px;
  border: #000 solid 1px;
  background-color:#4499bb;
}
.dm-country {
  stroke: #537700;
}
</style>
