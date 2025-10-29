const sources = [
  {
    name: "webtel",
    url: "https://webtel.in/Blog/A-Comprehensive-Guide-to-HR-Policies-in-India/2353",
    selectors: {
      container: `#blogbody`,
      publishedAt: "#BlogHead > li:nth-child(1)",
    },
  },
  {
    name: "rapid",
    url: "https://www.rapid.one/blog/hr-policies-in-india",
    selectors: {
			container: `body > div.page-wrapper > div > section.section-blog-list > div > div > div.blog-content.blog-con > div`,
			publishedAt: null,
    },
  },
  {
    name: "loophealth",
    url: "https://www.loophealth.com/post/various-types-of-hr-policies",
    selectors: {
			container: `#blog-article-content-rct > div.text-rich-text.w-richtext`,
			publishedAt: "#blog-article-header > div > div.blog-article-header_heading-wrapper > div.blog-author-readtime_component.is-article > div.blog-author-readtime_author > div",
    },
  },
];

export default sources;
