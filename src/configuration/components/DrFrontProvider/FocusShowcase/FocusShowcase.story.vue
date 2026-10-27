<script setup lang="ts">
import { ref, shallowRef } from 'vue';
import FocusDialogContent from '@/configuration/components/DrFrontProvider/FocusShowcase/FocusDialogContent.story.vue';
import { useDialog } from '@/dialogs/composables/useDialog/useDialog';
import { DrArrowLeftIcon, DrCheckIcon } from '@/icons';
import {
  DrButton,
  DrCheckbox,
  DrConfigProvider,
  DrExpandableSection,
  DrFilePickerButton,
  DrIconButton,
  DrInput,
  DrInputDate,
  DrInputNumber,
  DrInputTime,
  DrMaskedInput,
  DrRadioGroup,
  DrSection,
  DrSelect,
  DrTabPanel,
  DrTabSwitcher,
  DrTextarea,
  useDrToast,
} from '@/index';

defineOptions({ inheritAttrs: false });

const name = ref('Ada Lovelace');
const code = ref('123456');
const quantity = ref<number | null>(12);
const date = shallowRef<Temporal.PlainDate | null>(Temporal.PlainDate.from('2026-04-18'));
const time = shallowRef<Temporal.PlainTime | null>(Temporal.PlainTime.from('09:30'));
const note = ref('A short note with actions below.');
const invalid = ref('Needs review');
const readonly = ref('Available to select and copy');
const disabled = ref('Unavailable');
const invalidNote = ref('Please review this note.');
const city = ref('London');
const invalidCity = ref('Paris');
const cities = ['London', 'Paris', 'Tokyo'];
const notifications = ref(true);
const consent = ref(false);
const unavailable = ref(true);
const delivery = ref('Courier');
const deliveryOptions = ['Courier', 'Pickup', 'In store'];
const currentTab = ref('Overview');
const tabs = ['Overview', 'Details'];
const details = ref('Project details');
const extra = ref('Optional information');
const saved = ref(false);
const fileName = ref('No file selected');
const nativeClicks = ref(0);
const toast = useDrToast();
const dialog = useDialog({ title: 'Focus in a dialog', component: FocusDialogContent });

function handleInsertExample() {
  note.value = 'Meet at 10:00 to review the components.';
}

function handleSave() {
  saved.value = true;
}

function handleReset() {
  saved.value = false;
}

function handleFile(file: File) {
  fileName.value = file.name;
}

function handleNativeClick() {
  nativeClicks.value += 1;
}

function handleOpenDialog(event: MouseEvent) {
  dialog.open(undefined, {
    opener: event.currentTarget instanceof HTMLElement ? event.currentTarget : null,
  });
}

function handleShowToast() {
  toast.info({
    title: 'Focus in a notification',
    message: 'Use Tab to reach the close button, or dismiss this notification with the pointer.',
    duration: 30000,
  });
}
</script>

<template>
  <div class="GalleryExample DrFocusShowcase">
    <p class="DrFocusShowcase__intro">
      Use Tab and Shift+Tab to compare focus indicators.
      Fields, internal actions, and selection controls are interactive.
      Use the Gallery theme switch to compare light and dark themes.
    </p>

    <DrSection title="Text fields and internal actions">
      <div class="GalleryExample__grid">
        <DrInput
          v-model="name"
          label="Input"
          message="Text input with a clear button"
        />

        <DrMaskedInput
          v-model="code"
          label="Masked input"
          mask="000-000"
          message="Six digits with a separator"
        />

        <DrInputNumber
          v-model="quantity"
          label="Number"
          :min="-99"
          :max="99"
          clearable
          message="Use arrow keys or the sign and stepper buttons"
        />

        <DrInputDate
          v-model="date"
          label="Date"
        />

        <DrConfigProvider locale="en-US">
          <DrInputTime
            v-model="time"
            label="Time"
            message="The AM/PM button is a separate Tab stop"
          />
        </DrConfigProvider>

        <DrTextarea
          v-model="note"
          label="Textarea"
          :rows="3"
        >
          <template #actions>
            <DrButton
              variant="ghost"
              size="small"
              @click="handleInsertExample"
            >Insert example</DrButton>
          </template>
        </DrTextarea>
      </div>
    </DrSection>

    <DrSection title="Field states">
      <div class="GalleryExample__grid">
        <DrInput
          v-model="invalid"
          label="Invalid input"
          state="error"
          message="An error border remains visible during focus"
        />

        <DrInput
          v-model="readonly"
          label="Read-only input"
          readonly
        />

        <DrInput
          v-model="disabled"
          label="Disabled input"
          disabled
        />

        <DrTextarea
          v-model="invalidNote"
          label="Invalid textarea"
          :rows="2"
          state="error"
          message="Review required"
        />
      </div>
    </DrSection>

    <DrSection title="Selection">
      <div class="GalleryExample__grid">
        <DrSelect
          v-model="city"
          label="City"
          :items="cities"
        />

        <DrSelect
          v-model="invalidCity"
          label="Invalid select"
          :items="cities"
          state="error"
          message="Confirm the delivery city"
        />

        <DrRadioGroup
          v-model="delivery"
          label="Delivery"
          :items="deliveryOptions"
        >
          <template #item="{ item }">{{ item }}</template>
        </DrRadioGroup>
      </div>

      <div class="GalleryExample__row">
        <DrCheckbox
          v-model="notifications"
          label="Notifications"
        />

        <DrCheckbox
          v-model="consent"
          label="Accept terms"
          :state="consent ? 'normal' : 'error'"
          :message="consent ? 'Accepted' : 'Required'"
        />

        <DrCheckbox
          v-model="unavailable"
          label="Disabled checkbox"
          disabled
        />
      </div>
    </DrSection>

    <DrSection title="Actions">
      <div class="GalleryExample__row">
        <DrButton
          variant="solid"
          @click="handleSave"
        >Save</DrButton>

        <DrButton @click="handleReset">Reset</DrButton>

        <DrButton
          variant="ghost"
          @click="handleReset"
        >
          <DrArrowLeftIcon />
          Undo save
        </DrButton>

        <DrIconButton
          class="DrFocusShowcase__iconButton"
          :aria="{ ariaLabel: 'Save with icon' }"
          @click="handleSave"
        >
          <DrCheckIcon :size="24" />
        </DrIconButton>

        <DrFilePickerButton
          label="Choose a file"
          @select="handleFile"
        />

        <DrButton disabled>Disabled button</DrButton>

        <DrButton loading>Loading</DrButton>
      </div>

      <p class="GalleryExample__output">{{ saved ? 'Saved' : 'Not saved' }} · {{ fileName }}</p>
    </DrSection>

    <DrSection title="Tabs and expandable sections">
      <DrTabSwitcher
        id="focus-showcase-tabs"
        v-model="currentTab"
        :items="tabs"
        :aria="{ ariaLabel: 'Showcase sections' }"
      >
        <template #item="{ item }">{{ item }}</template>
      </DrTabSwitcher>

      <DrTabPanel
        switcher-id="focus-showcase-tabs"
        panel-id="Overview"
        :current="currentTab"
      >
        <p>Use arrow keys to switch tabs. The Details tab contains an editable field.</p>
      </DrTabPanel>

      <DrTabPanel
        switcher-id="focus-showcase-tabs"
        panel-id="Details"
        :current="currentTab"
      >
        <DrInput
          v-model="details"
          label="Details"
        />
      </DrTabPanel>

      <DrExpandableSection title="Additional information">
        <DrInput
          v-model="extra"
          label="Additional input"
        />
      </DrExpandableSection>

      <DrExpandableSection
        title="Disabled section"
        disabled
      >Unavailable content</DrExpandableSection>
    </DrSection>

    <DrSection title="Native HTML elements">
      <div class="GalleryExample__row">
        <a href="#focus-showcase-native-destination">Jump to native example note</a>

        <button
          type="button"
          @click="handleNativeClick"
        >Native button</button>

        <span>Button clicks: {{ nativeClicks }}</span>
      </div>

      <div class="GalleryExample__grid">
        <div class="DrFocusShowcase__nativeField">
          <label for="focus-showcase-native-input">Native text input</label>

          <input
            id="focus-showcase-native-input"
            type="text"
            value="Editable native value"
          />
        </div>

        <div class="DrFocusShowcase__nativeField">
          <label for="focus-showcase-native-textarea">Native textarea</label>

          <textarea
            id="focus-showcase-native-textarea"
            rows="3"
          >Editable native note.</textarea>
        </div>

        <div class="DrFocusShowcase__nativeField">
          <label for="focus-showcase-native-select">Native select</label>

          <select id="focus-showcase-native-select">
            <option>London</option>

            <option>Paris</option>

            <option>Tokyo</option>
          </select>
        </div>
      </div>

      <div class="GalleryExample__row">
        <label>
          <input
            type="checkbox"
            checked
          />
          Native checkbox
        </label>

        <label>
          <input
            type="radio"
            name="focus-showcase-native-delivery"
            value="courier"
            checked
          />
          Native courier
        </label>

        <label>
          <input
            type="radio"
            name="focus-showcase-native-delivery"
            value="pickup"
          />
          Native pickup
        </label>
      </div>

      <details>
        <summary>Native details</summary>

        <p>This content expands with the standard details control.</p>
      </details>

      <p
        id="focus-showcase-native-destination"
        class="DrFocusShowcase__intro"
      >
        Native elements use the same global focus styles as the Dr Front controls above.
      </p>
    </DrSection>

    <DrSection title="Dialog and notification">
      <div class="GalleryExample__row">
        <DrButton @click="handleOpenDialog">Open dialog</DrButton>

        <DrButton @click="handleShowToast">Show notification</DrButton>
      </div>
    </DrSection>
  </div>
</template>

<style scoped>
  .DrFocusShowcase__intro {
    margin: 0;
    color: var(--dr-color-text-secondary);
    line-height: 1.5;
  }

  .DrFocusShowcase__iconButton {
    width: 40px;
    height: 40px;
    border: 1px solid var(--dr-color-border-primary);
  }

  .DrFocusShowcase__nativeField {
    display: flex;
    flex-direction: column;
    gap: var(--dr-space-xsmall);
    min-width: 0;
  }
</style>
