<template>
  <div ref="iconSelectRef" :style="{ width: props.width }">
    <el-popover :visible="popoverVisible" :width="props.width" placement="bottom-end">
      <template #reference>
        <div @click="popoverVisible = !popoverVisible">
          <slot>
            <el-input
              v-model="selectedIcon"
              readonly
              :placeholder="$t('form.selectIcon')"
              class="reference"
            >
              <template #prepend>
                <icon-font :name="selectedIcon" />
              </template>
              <template #suffix>
                <!-- 清空按钮 -->
                <el-icon
                  v-if="selectedIcon"
                  style="margin-right: 8px"
                  @click.stop="clearSelectedIcon"
                >
                  <CircleClose />
                </el-icon>

                <el-icon
                  :style="{
                    transform: popoverVisible ? 'rotate(180deg)' : 'rotate(0)',
                    transition: 'transform .5s',
                  }"
                >
                  <ArrowDown @click.stop="togglePopover" />
                </el-icon>
              </template>
            </el-input>
          </slot>
        </div>
      </template>

      <!-- 图标选择弹窗 -->
      <div ref="popoverContentRef">
        <el-input
          v-model="filterText"
          :placeholder="$t('form.searchIcon')"
          clearable
          @input="filterIcons"
        />
        <el-scrollbar height="300px">
          <div class="grid-list">
            <el-link
              v-for="icon in filteredSvgIcons"
              :key="'svg-' + icon"
              class="grid-item"
              underline="never"
              @click="selectIcon(icon)"
            >
              <el-tooltip :content="icon" placement="bottom" effect="light">
                <icon-font :name="icon" font-size="20px" />
              </el-tooltip>
            </el-link>
          </div>
        </el-scrollbar>
      </div>
    </el-popover>
  </div>
</template>

<script setup lang="ts">
import iconFontData from "@/assets/iconfont/iconfont.json";

const props = defineProps({
  modelValue: {
    default: "",
    type: String,
  },
  width: {
    default: "500px",
    type: String,
  },
});

const emit = defineEmits(["update:modelValue"]);

const iconSelectRef = ref();
const popoverContentRef = ref();
const popoverVisible = ref(false);

const svgIcons = ref<string[]>([]);
const selectedIcon = defineModel("modelValue", {
  default: "",
  required: true,
  type: String,
});

const filterText = ref("");
const filteredSvgIcons = ref<string[]>([]);

function getIconList() {
  const glyphs = iconFontData.glyphs;
  const list = glyphs.map((item: any) => item.name);
  svgIcons.value = list;
  filteredSvgIcons.value = list;
}

function filterIcons() {
  filteredSvgIcons.value = filterText.value
    ? svgIcons.value.filter((icon) => icon.toLowerCase().includes(filterText.value.toLowerCase()))
    : svgIcons.value;
}

function selectIcon(iconName: string) {
  emit("update:modelValue", iconName);
  popoverVisible.value = false;
}

function togglePopover() {
  popoverVisible.value = !popoverVisible.value;
}

onClickOutside(iconSelectRef, () => (popoverVisible.value = false), {
  ignore: [popoverContentRef],
});

/**
 * 清空已选图标
 */
function clearSelectedIcon() {
  selectedIcon.value = "";
}

onMounted(() => {
  getIconList();
});
</script>

<style scoped lang="scss">
.reference :deep(.el-input__wrapper),
.reference :deep(.el-input__inner) {
  cursor: pointer;
}

.grid-list {
  display: inline-flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 15px;
  .grid-item {
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    border: 1px solid #dcdfe6;
    border-radius: 4px;
    transition: all 0.3s;
    width: 42px;
    height: 42px;
    &:hover {
      border-color: var(--el-link-text-color);
      transform: scale(1.2);
    }
  }
}
</style>
