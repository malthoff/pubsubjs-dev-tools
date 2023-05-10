<script setup lang="ts">
import { Ref, onBeforeUnmount, onMounted, ref, watch } from "vue";
import { PubSubEvent } from "./types/event-types";
import EventList from "./components/EventList.vue";
import DetailsView from "./components/DetailsView.vue";

declare global {
  interface Window {
    PubSub: any;
  }
}

const isPubSubDefined = ref(false);

let intervalId: number | null = null;

let eventList: Ref<PubSubEvent[]> = ref([]);

const selectedData = ref();

onMounted(async () => {
  checkIsPubSubDefined();
});

function startPubSubListener() {
  chrome.devtools.inspectedWindow.eval(
    "if(!window.__PubSubContainer) {window.__PubSubContainer = {}}; var mySubscriber = (message, data) => {if(!window.__PubSubContainer[message]){window.__PubSubContainer[message] = []} __PubSubContainer[message].push({timestamp: new Date(), payload: data})};PubSub.subscribeAll(mySubscriber)"
  );
}

function updateEvents(): void {
  chrome.devtools.inspectedWindow.eval(
    "JSON.stringify(window.__PubSubContainer)",
    (result: string) => {
      if (result) {
        const parsed = JSON.parse(result);
        eventList.value =
          Object.keys(parsed).map<PubSubEvent>((eventName) => ({
            source: eventName,
            value: parsed[eventName],
          })) ?? [];
      }
    }
  );
}

function startReadingEvents() {
  stopReadingEvents();
  intervalId = setInterval(() => {
    updateEvents();
  }, 1000);
}

function checkIsPubSubDefined() {
  chrome.devtools.inspectedWindow.eval(
    "typeof window.PubSub !== 'undefined'",
    (result: boolean) => {
      isPubSubDefined.value = result;
    }
  );
}

function stopReadingEvents() {
  if (intervalId !== null) {
    clearInterval(intervalId);
  }
}

function selectData(data: any) {
  selectedData.value = data;
}

watch(isPubSubDefined, (isPubSubDefined) => {
  if (isPubSubDefined) {
    startPubSubListener();
    startReadingEvents();
  }
});

onBeforeUnmount(() => {
  stopReadingEvents();
});
</script>

<template>
  <div class="flex gap-2 w-full h-full overflow-hidden">
    <div class="min-w-2-3 h-screen overflow-y-auto p-4">
      <EventList :events="eventList" @select="selectData"></EventList>
    </div>
    <div class="min-w-1-3 h-screen overflow-y-auto p-4">
      <DetailsView :data="selectedData"></DetailsView>
    </div>
  </div>
</template>
