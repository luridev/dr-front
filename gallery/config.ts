import type { GalleryGroup } from '~/gallery/types';

export const galleryGroups: Array<GalleryGroup> = [
  {
    title: 'Actions',
    stories: [
      {
        id: 'actions/components/DrButton/DrButtonGallery',
        title: 'DrButton · DrIconButton',
        description: 'Variants, sizes, and states.',
      },
    ],
  },
  {
    title: 'Forms',
    stories: [
      {
        id: 'forms/components/DrInput/DrInputGallery',
        title: 'DrInput',
        description: 'Text, validation, and slots.',
      },
      {
        id: 'forms/components/DrInputNumber/DrInputNumberGallery',
        title: 'DrInputNumber',
        description: 'Steps and limits.',
      },
      {
        id: 'forms/components/DrInputDate/DrInputDateGallery',
        title: 'DrInputDate',
        description: 'Dates and input states.',
      },
      {
        id: 'forms/components/DrInputTime/DrInputTimeGallery',
        title: 'DrInputTime',
        description: 'Time and precision.',
      },
      {
        id: 'forms/components/DrTextarea/DrTextareaGallery',
        title: 'DrTextarea',
        description: 'Multiline text and actions.',
      },
      {
        id: 'forms/components/DrSelect/DrSelectGallery',
        title: 'DrSelect',
        description: 'Selection and states.',
      },
      {
        id: 'forms/components/DrCheckbox/DrCheckboxGallery',
        title: 'DrCheckbox',
        description: 'Checked and disabled states.',
      },
      {
        id: 'forms/components/DrRadioGroup/DrRadioGroupGallery',
        title: 'DrRadioGroup',
        description: 'Options and custom labels.',
      },
      {
        id: 'forms/components/DrFilePickerButton/DrFilePickerButtonGallery',
        title: 'DrFilePickerButton',
        description: 'File selection and states.',
      },
      {
        id: 'forms/components/DrControl/DrControlGallery',
        title: 'DrControl',
        description: 'Custom field wrapper.',
      },
      {
        id: 'forms/components/DrControlGroup/DrControlGroupGallery',
        title: 'DrControlGroup · useControlsState',
        description: 'Grouped fields and validation.',
      },
    ],
  },
  {
    title: 'Output and feedback',
    stories: [
      {
        id: 'data-display/components/DrOutput/DrOutputGallery',
        title: 'DrOutput',
        description: 'Results and loading.',
      },
      {
        id: 'feedback/components/DrAlert/DrAlertGallery',
        title: 'DrAlert',
        description: 'Messages and errors.',
      },
      {
        id: 'feedback/toasts/components/DrToastHost/DrToastGallery',
        title: 'DrToastHost · toast',
        description: 'Notifications and queues.',
      },
    ],
  },
  {
    title: 'Layout and navigation',
    stories: [
      {
        id: 'layout/components/DrSection/DrLayoutGallery',
        title: 'Layout',
        description: 'Sections, grids, and panels.',
      },
      {
        id: 'navigation/tabs/components/DrTabSwitcher/DrTabsGallery',
        title: 'DrTabSwitcher · DrTabPanel',
        description: 'Tabs and panels.',
      },
      {
        id: 'icons/DrIconsGallery',
        title: 'Icons',
        description: 'Size and color.',
      },
    ],
  },
];
