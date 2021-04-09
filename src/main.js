// This is the main entry point to the lib, it is used only to execute the lib by itself.
// The lib by itself, only displays the map without any features.
// Usually these features are provided by plugins, that are queued and compiled by the transpiler.
// This file is not bundled within the HexaMaps build.
import Vue from "vue";
import Map from "./components/HmMap";
import config from "./config";
import transpile from "./lib/transpile";
import addons from "./addons";

const defaultConfig = {
  width: 800,
  height: 600,
  zoom: 1,
  scale: 1,
  initialScale: 1,
  x: 0,
  y: 0,
  theta: 0,
  phi: 0,
  angle: 0,
  projectionName: "geoMercator",
  withGraticule: false,
};

// Transpiling plugins
const { plugins, editables } = transpile(addons);

for (let addonName in config.addonsConfig) {
  for (let attr in config.addonsConfig[addonName].map) {
    editables[addonName].map.values[attr] =
      config.addonsConfig[addonName].map[attr];
  }
}

// Creating a map component that uses the transpiled plugins
const HmMap = Map(plugins);
const Hexamaps = {
  name: "HexaMap",
  render: function (createElement) {
    return createElement(HmMap);
  },
  data() {
    return {
      data: [],
      source: config.sourceUrl,
      config: config.config,
    };
  },
  mounted() {
    this.config = config.config;
    this.load(config.dataUrl);
  },
  provide() {
    const map = { data: [], source: "", config: defaultConfig };
    Object.defineProperty(map, "data", {
      enumerable: true,
      get: () => this.data,
      set: (data) => (this.data = data),
    });
    Object.defineProperty(map, "config", {
      enumerable: true,
      get: () => this.config,
      set: (config) => (this.config = config),
    });
    Object.defineProperty(map, "source", {
      enumerable: true,
      get: () => this.source,
    });
    return { map };
  },
  methods: {
    load(dataUrl) {
      fetch(dataUrl)
        .then((response) => {
          return response.json();
        })
        .then((json) => {
          this.data = json;
        })
        .catch((err) => {
          // eslint-disable-next-line no-console
          console.error(err);
        });
    },
  },
};

Vue.config.productionTip = false;

Vue.use(plugins.entry, { editor: false, panEnabled: true, zoomEnabled: true });

new Vue({
  editor: false,
  render: (h) => h(Hexamaps),
}).$mount("#app");
