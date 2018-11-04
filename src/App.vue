<template>
  <div id="dm-app">
    <dm-map/>
  </div>
</template>

<script>
import DmMap from './components/DmMap'
export default {
  name: 'DmApp',
  components: {
    DmMap
  }
}
</script>

<style>
body {
  margin: 5px 5px;
}
.dm-map {
  width: 100%;
  height: 600px;
  border: #000 solid 1px;
}
.dm-country {
  stroke: #537700;
}
</style>
