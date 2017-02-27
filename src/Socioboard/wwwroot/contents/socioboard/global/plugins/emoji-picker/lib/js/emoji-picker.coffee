class @EmojiPicker
  # Options:
  #    spriteSheetPath: Path to each category's sprite sheet. Use '!' as a placeholder for the number (see default).
  #    iconSize: The size of each Emoji icon in the picker.
  #    textareaId: The ID to select the textarea that will be converted to a WYSIWYG.
  #    popupElementId: The ID of the element that, when clicked, will display the popup menu.
  constructor: (options = {}) ->
    $.emojiarea.iconSize = options.iconSize ? 25;
    $.emojiarea.assetsPath = options.assetsPath ? '';
    @generateEmojiIconSets(options)
    options.emojiable_selector = '[data-emojiable=true]' if !options.emojiable_selector
    this.options = options;

  discover: ->
    isiOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    if (isiOS)
      return;
    # Convert every emojiable field to an emoji area
    $(this.options.emojiable_selector).emojiarea($.extend({
        emojiPopup: this,
        norealTime: true,
      }, this.options));


  generateEmojiIconSets:(options) ->
    icons = {}
    reverseIcons = {}
    i = undefined
    j = undefined
    hex = undefined
    name = undefined
    dataItem = undefined
    row = undefined
    column = undefined
    totalColumns = undefined
    j = 0
    while j < Config.EmojiCategories.length
      totalColumns = Config.EmojiCategorySpritesheetDimens[j][1]
      i = 0
      while i < Config.EmojiCategories[j].length
        dataItem = Config.Emoji[Config.EmojiCategories[j][i]]
        name = dataItem[1][0]
        row = Math.floor(i / totalColumns)
        column = i % totalColumns
        icons[':' + name + ':'] = [j, row, column, ':' + name + ':'];
        reverseIcons[name] = dataItem[0]
        i++
      j++

    $.emojiarea.icons = icons;
    $.emojiarea.reverseIcons = reverseIcons;

  colonToUnicode:(input) ->
    if !input
      return ''
    if !Config.rx_colons
      Config.init_unified()
    input.replace Config.rx_colons, (m) ->
      val = Config.mapcolon[m]
      if val
        val
      else
        ''

  unicodeToImage:(input) ->
    if !input
      return ''
    if !Config.rx_codes
      Config.init_unified()
    input.replace Config.rx_codes, (m) ->
      val = Config.reversemap[m]
      if val
        val = ':' + val + ':'
        $img = $.emojiarea.createIcon($.emojiarea.icons[val])
        $img
      else
        ''

  colonToImage:(input) ->
    if !input
      return ''
    if !Config.rx_colons
      Config.init_unified()
    input.replace Config.rx_colons, (m) ->
      if m
        $img = $.emojiarea.createIcon($.emojiarea.icons[m])
        $img
      else
        ''