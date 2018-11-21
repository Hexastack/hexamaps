<template>
  <div id="dm-app">
    <choropleth
      :data="data"
      :source="source"
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
  },
  data () {
    return {
      data: [{name: "AUS",value: 48829.027796}, {name: "AUT",value: 50923.693301}],
      source: '/topos/world110m.json'
    }
  }
}
</script>

<style>
body {
  margin: 5px 5px;
}
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
