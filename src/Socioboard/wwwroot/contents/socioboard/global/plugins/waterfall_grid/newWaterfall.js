/*	   Waterfall Flow Code By: ONEO 2015.08.26
	NewWaterfall Flow Code By: ONEO 2016.10.25
------------------------------------------------------*/
(function()
{
	$.fn.NewWaterfall = function(options)
	{
		// 参数
		var defaults = {
			width: $(this).parent().width() / 3.1,
			delay: 60,
			repeatShow: false
		};
		var config = $.extend({},defaults, options);
		var ul = this;
		// 功能
		var show = function(li)
		{
			if ($(window).scrollTop() + $(window).height() > $(li).offset().top)
			{
				$(li).addClass('show');
			}
			else if ($(window).scrollTop() + $(window).height() < $(li).offset().top)
			{
				if (config.repeatShow)
				{
					$(li).removeClass('show');
				}
			}
		}
		var refresh = function()
		{
			if(ul.length <= 0)
			{
				return;
			}

			ul.css({
				"position": "relative"
			});

			// 参数
			var lis = $(ul).children("li");

			if(lis.length <= 0)
			{
				return;
			}

			var ul_width = $(ul).width() - 17;
			var ul_column = parseInt(ul_width / config.width);

			if (lis.length < ul_column)
			{
				ul_column = lis.length;
			}
			
			var li_left = (ul_width - ul_column * config.width) / 1;

			if (ul_column > 0)
			{
				$(ul).removeClass('min');
				
				// 基础样式设置
				lis.css({
					"position": "absolute",
					"width": config.width
				});

				// 变量
				var maxHeight = 0;
				var list = []
				var nlist = []

				// 初始化列表
				for (var i = 0; i < lis.length; i++)
				{
					list.push({
						"index": i,
						"bottom": 0,
						"height": $(lis[i]).height(),
					});
				}

				// 初始化列
				for (var i = 0; i < ul_column; i++)
				{
					nlist.push([]);
				}

				// 智能排序
				for (var i = 0; i < lis.length; i++)
				{
					if (i < ul_column)
					{
						list[i]["bottom"] = list[i]["height"];
						nlist[i].push(list[i]);
					}
					else
					{
						var b = 0;
						var l = 0;
						for (var j = 0; j < ul_column; j++)
						{
							var jh = nlist[j][nlist[j].length - 1]["bottom"] + list[i]["height"];
							if (b == 0 || jh < b)
							{
								b = jh;
								l = j;
							}
						}
						list[i]["bottom"] = b;
						nlist[l].push(list[i]);
					}
				}

				// 开始布局
				for (var i = 0; i < nlist.length; i++)
				{
					for (var j = 0; j < nlist[i].length; j++)
					{
						$(lis[nlist[i][j]["index"]]).css({
							"left": i * config.width ,//+ li_left
							"top": nlist[i][j]["bottom"] - nlist[i][j]["height"]
						});
					}
				}

				// 设置最大高度
				for (var i = 0; i < nlist.length; i++)
				{
					var h = nlist[i][nlist[i].length -1]["bottom"];
					if (maxHeight < h)
					{
						maxHeight = h;
					}
				}
				$(ul).css("height",maxHeight);
			}
			else
			{
				lis.attr("style","");
				ul.attr("style","");
				$(ul).addClass('min');
			}

			// 显示列表
			for (var i = 0; i < lis.length; i++)
			{
				show(lis[i]);
			}
		}

		// 刷新
		refresh();
		setInterval(refresh,config.delay);
	}
})();