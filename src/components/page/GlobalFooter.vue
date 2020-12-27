<template>
  <div class="footer">
    <div class="line">
      <span v-html="$config.footer" />
    </div>
  </div>
</template>

<script>
export default {
  name: 'LayoutFooter',
  data () {
    return {
    }
  }
}
</script>

<style lang="less" scoped>
  .footer {
    padding: 0 16px;
    margin: 48px 0 24px;
    text-align: center;

    .line {
      margin-bottom: 8px;

      a {
        color: rgba(0, 0, 0, .45);

        &:hover {
          color: rgba(0, 0, 0, .65);
        }

      }
    }
    .copyright {
      color: rgba(0, 0, 0, .45);
      font-size: 14px;
    }
  }
</style>
