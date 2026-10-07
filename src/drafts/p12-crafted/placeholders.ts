/**
 * Tiny pictures of each print's two faces (24px wide WebP, rendered from the print's own pictures by a script),
 * shown under the pictures until they are decoded and the lens is up: a print never enters as a blank card.
 */
export const PLACEHOLDERS: Record<string, { wide?: readonly [string, string]; narrow?: readonly [string, string] }> = {
  "bayyinah": {
    wide: [
      "data:image/webp;base64,UklGRoYAAABXRUJQVlA4IHoAAADwAwCdASoYAAsAPtFYpkwoJSOiMAgBABoJZwC7ACHOI+yOjxX7kuAAAP7ynfiUaofmXk6i6YfipnXa9RK3TGkPm/SIIjv4RqQBI8iPo96qml9MzxAR0+bS7GXYnABq8Gf8H3/zRi7c/kbMqa+MRb48K7OuNr5CyAAAAA==",
      "data:image/webp;base64,UklGRoQAAABXRUJQVlA4IHgAAADwAwCdASoYAAsAPtFUo0uoJKMhsAgBABoJbACdMoR3ACnKdThYobQAAP7s20D3npuiPjManKQwcPdSZ6gMLVbhHyAoeTfwr8JI4Y7e8LcnLe3/adeIK32IshAVzj8Os709z0tjmHhRhNMDNhjELPn4cwEdjNwAAAA=",
    ],
    narrow: [
      "data:image/webp;base64,UklGRooAAABXRUJQVlA4IH4AAABwBACdASoYABEAPslQoUunpKMht/VYAPAZCWMAwzQQ6Vi9PBhs3hYktM+qwAD+8QlBrr94OIHGPz8ixTsE3ZIg5fvrclkOD+5Yd2kd5BFnq6glXVN0YwmUx5PiG3fl8uEA1lMA7LCfPF318NXCswBpWB7k+myRTmgAqx8AAAA=",
      "data:image/webp;base64,UklGRoQAAABXRUJQVlA4IHgAAABQBACdASoYABEAPtFUpU2oJCOiMBgIAQAaCWYAnTKAAaobMbHY/aukP+QAAP7yqRQVfPpEH+Oa7AUPLcPe7SFhgT3Zv1cAY01GKusQ6Cmt9W9yzMPwtoaovr8+zL0GDMvPPKrTkH8zkFS6Un5oOdQVefn3WxkAAAA=",
    ],
  },
  "bayyinah-org": {
    wide: [
      "data:image/webp;base64,UklGRo4AAABXRUJQVlA4IIIAAADQAwCdASoYAA8APtFUo0uoJKMhsAgBABoJQBOgBDv4+vmcgk7BswAA/lv/vxXxJSsULMlMm1uiFFry0sc+GZxsUpKxwP2bvNsymx0Nq6gMRdCWzncfd3Yoi6rTpYDl3rTtvJG10QC+fpwjG+W9x4/+LUr09SEbdjl14mdZRUUiAAAA",
      "data:image/webp;base64,UklGRmYAAABXRUJQVlA4IFoAAADQAwCdASoYAA8APtFYpEwoJSOiMAgBABoJQBOmUABffZ7sR/yfKIAA/vHfxEuUmtHYOHNczEhMG63He3AakXWCD3+E7toMPOV3Cm5BScjmCeks7JT+dem0AAA=",
    ],
    narrow: [
      "data:image/webp;base64,UklGRoAAAABXRUJQVlA4IHQAAAAwBACdASoYABMAPtFWpUwoJKOiKA1RABoJZQDA3BEYW+brOPYM8cPHcAAA/vHJ2/DAsf6TDm/k7MkVIdvQEQfCPJRugReGwm7DwA6K1YG0+ah/8Ix5RWon1r1nb8q4g41q/Q/+rYDgtrMfE0zC3ZNqkAAAAA==",
      "data:image/webp;base64,UklGRo4AAABXRUJQVlA4IIIAAABQBACdASoYABMAPsFOn0unpCKht/qoAPAYCUAXZmyAXgEJ7f3DRrsIzjFAAP7zgu33lzGxpMQutPVQqbYG23OfyE75HMgq5gAeo/IYZMewKiDYcTqhRUVrFfuoI23WGqyzdQnKSVaGdSVoIWivA7pVih9Mq+glqoZ4GRI3TPmbcAAA",
    ],
  },
  "care": {
    wide: [
      "data:image/webp;base64,UklGRmAAAABXRUJQVlA4IFQAAAAwAwCdASoYAA8APtFUo0uoJKMhsAgBABoJaV2AADb/U1AAAP7xF+MJ1LZZLJFI0P8JBNPGR8Bk49BvMBJFzdy8XPsCb5Ozi4DPmrDY1Swr06FAAAA=",
      "data:image/webp;base64,UklGRkIAAABXRUJQVlA4IDYAAADwAgCdASoYAA8APtFUo0uoJKMhsAgBABoJaWScADdYAAD+8cIBaEwKGfge5AofolSHb+UAAAA=",
    ],
    narrow: [
      "data:image/webp;base64,UklGRmIAAABXRUJQVlA4IFYAAADwAwCdASoYAA8APtFUpEuoJKOhsAgBABoJZwAAW+vrBEbqzB9r8MqAAP7yCTq9VGRC01mVEEmM9r8MIVDX2qSNPBTsAvfUf4FFohKYozgOIiLhT8CEAA==",
      "data:image/webp;base64,UklGRl4AAABXRUJQVlA4IFIAAACQAwCdASoYAA8APtFUo0uoJKMhsAgBABoJZwAAXewQ9MQ9H4RgAP7yDf4T4wqz+DQPlwCv7MwN8SOyvH/A5oOZ3XGBX7OXMAL6AyKK0+Y08IAA",
    ],
  },
  "read-to-feed": {
    wide: [
      "data:image/webp;base64,UklGRuIAAABXRUJQVlA4INYAAADQBgCdASoYACIAPslUoUunpKMhtVgIAPAZCWgAp0OiequM1dkoKoABIofKOroQ4i2TdCb8FWu4GZ4mA/ytjAAA/cmQAKQuO8K8kV4pjfxJSvLPqF/cxCI/qJWAeAjcv9omfkXv2mI4u86zPbFw/4OQ6BEE/bJ+EIIzLqVgpx3fHUyI6IVO9yYUpeFmmD7jGuVtBx8uAC9sPHdDiXvAGpuJImZB7PVBFVFG9GYSwDWKqPs4suojYmZoQ5VqkWng6yvHqg2Y7P7xfGjCA2VKoIukWarHIAAA",
      "data:image/webp;base64,UklGRvoAAABXRUJQVlA4IO4AAADQBQCdASoYACIAPtFWpEwoJKOiKrgN+QAaCWYAuKssE6KMYuuJgkglVlOz65CvyHySNACMhtJIAP75bkIAgbYtfjG5w9bpFXLxDkghILyb1z1cq3oZqCouvX6Aq395C2sK835Um5ElmmQvgjM0yH9zOJZN+Pa9leP+IdzcXTo46XyoUYPrqaZ3KZ8Cy/VNd/EtWbyIwbuG4/3nxaMCozJbewV3+En2OC56/0f45FyfgLF36LToH/X8rpkscnd7KVtHSAHWc5Lq0/QeE9yC0I4YyCXOOIzuiivKOrSuI4OqRkVByrsHChRv0WEYAAAA",
    ],
    narrow: [
      "data:image/webp;base64,UklGRuIAAABXRUJQVlA4INYAAADQBgCdASoYACIAPslUoUunpSMhtVgIAPAZCWgAp0OiequM1dkoKoABIofKOroQ4i2TdCb8FWu4GZ4mA/ytjAAA/cmQAKQuO8K8kV4pjfxJSvLPqF/cxCI/qJWAeAjcv9omfkXv2mI4u86zPbFw/4OQ6BEE/bJ+EIIzLqVgpx3fHUyI6IVO9yYUpeFmmD7jGuVtBx8uAC9sPHdDiXvAGpuJImZB7PVBFVFG9GYSwDWKqPs4suojYmZoQ5VqkWng6yvHqg2Y7P7xfGjCA2VKoIukWarHIAAA",
      "data:image/webp;base64,UklGRvoAAABXRUJQVlA4IO4AAADQBQCdASoYACIAPtFWpEwoJKOiKrgN+QAaCWYAuKssE6KMYuuJgkglVlOz65CvyHySNACMhtJIAP75bkIAgbYtfjG5w9bpFXLxDkghILyb1z1cq3oZqCouvX6Aq395C2sK835Um5ElmmQvgjM0yH9zOJZN+Pa9leP+IdzcXTo46XyoUYPrqaZ3KZ8Cy/VNd/EtWbyIwbuG4/3nxaMCozJbewV3+En2OC56/0f45FyfgLF36LToH/X8rpkscnd7KVtHSAHWc5Lq0/QeE9yC0I4YyCXOOIzuiivKOrSuI4OqRkVByrsHChRv0WEYAAAA",
    ],
  },
  "viva-fresh": {
    wide: [
      "data:image/webp;base64,UklGRhoBAABXRUJQVlA4IA4BAADQBgCdASoYACIAPs1UpUunpKOhsBqqqPAZiWwAnTL+rK0dxTMdgAm59to9ZhaBDDgkwqyZRjhQzkrLpy8zuigA/m6M9/dnVcWVX6dhUdh/FJnt/e9jqh9X0zuXYlKp1ZuEZ/gr99Fbdy+PssN/jJXdGV572e/rSqWYMSaK/sBZAWbOL47es2IHw2EKWum6XpuHUT5Qwj/xdW5gXrwRxc/D+p8/YGFP9JgeTeHZ5pesUXdNxxok4EVbkfUe/LUlPWX0WwrR1KpAJNpXyuSEd/epNHGQNWPUz1XCtdQkzwbAP/iPSW5tFNdiX5XFN6IPRNwmIuJxBieNZ3GCAzOh/0bYnv3s7WgVkSVRCVQAAAA=",
      "data:image/webp;base64,UklGRhwBAABXRUJQVlA4IBABAACwBgCdASoYACIAPtFYo04oJKKiKrgMAQAaCWUAzwzIIMoYyBKDTZsom1OKiHJRb+lBZW6Co3ecFya/gto4AAD+9lid3uRSmT3+ArelY/Uzbdg4OoEAq/Fum4L5qVSP/B772DOlHtCAtjX31U/2wQPoOauznbiHxy8gcvYK3Zm6slyChY9r/w6y1oitvCueI7tVXaWAPVfj9vRFJbFLD/I/EHcr0Ib2NzzGahaYUOjgmyrG8nLXGIoEasELMHiqkKS9scEoaf0zMQmdApO7hwUVUq5dj+rj9B3svKjiZbWy92lX6K8uw7vE39uGyROg4t6yV9sVFjAyC7ellJRdl6QiQdXVu9f/09m3xkmSDFwAAA==",
    ],
    narrow: [
      "data:image/webp;base64,UklGRhoBAABXRUJQVlA4IA4BAADQBgCdASoYACIAPs1UpUunpKOhsBqqqPAZiWwAnTL+rK0dxTMdgAm59to9ZhaBDDgkwqyZRjhQzkrLpy8zuigA/m6M9/dnVcWVX6dhUdh/FJnt/e9jqh9X0zuXYlKp1ZuEZ/gr99Fbdy+PssN/jJXdGV572e/rSqWYMSaK/sBZAWbOL47es2IHw2EKWum6XpuHUT5Qwj/xdW5gXrwRxc/D+p8/YGFP9JgeTeHZ5pesUXdNxxok4EVbkfUe/LUlPWX0WwrR1KpAJNpXyuSEd/epNHGQNWPUz1XCtdQkzwbAP/iPSW5tFNdiX5XFN6IPRNwmIuJxBieNZ3GCAzOh/0bYnv3s7WgVkSVRCVQAAAA=",
      "data:image/webp;base64,UklGRhwBAABXRUJQVlA4IBABAACwBgCdASoYACIAPtFYo04oJKKiKrgMAQAaCWUAzwzIIMoYyBKDTZsom1OKiHJRb+lBZW6Co3ecFya/gto4AAD+9lid3uRSmT3+ArelY/Uzbdg4OoEAq/Fum4L5qVSP/B772DOlHtCAtjX31U/2wQPoOauznbiHxy8gcvYK3Zm6slyChY9r/w6y1oitvCueI7tVXaWAPVfj9vRFJbFLD/I/EHcr0Ib2NzzGahaYUOjgmyrG8nLXGIoEasELMHiqkKS9scEoaf0zMQmdApO7hwUVUq5dj+rj9B3svKjiZbWy92lX6K8uw7vE39uGyROg4t6yV9sVFjAyC7ellJRdl6QiQdXVu9f/09m3xkmSDFwAAA==",
    ],
  },
  "offday": {
    wide: [
      "data:image/webp;base64,UklGRkAAAABXRUJQVlA4IDQAAADwAgCdASoYAA8APtFUo0uoJKMhsAgBABoJaQAAetCqXAD+8c7Mdgyo4pr918ib+iOv6QAA",
      "data:image/webp;base64,UklGRlQAAABXRUJQVlA4IEgAAADQAwCdASoYAA8APtFWo0uoJKMhsAgBABoJZwCw7CHw2Exz/RfE2AAA/vHOCve3bIY132r3qqosNBKpejXrANtONTuxURLiAAA=",
    ],
    narrow: [
      "data:image/webp;base64,UklGRloAAABXRUJQVlA4IE4AAAAQBACdASoYABEAPtFWokuoJKMhsAgBABoJaQAAW8uypEYlulXjJm934AD+8EDLUayVs7DT3Q4GpQeETuR0Pka+Ixru2/M2HiByYelAAAA=",
      "data:image/webp;base64,UklGRmYAAABXRUJQVlA4IFoAAACwAwCdASoYABEAPtFepk6oJSMiKAqpABoJZwDBzBEcZSjSMmRcAAD+8ddpz0MZvOiE9XjzxKnkASBej5+RFyC1n8YkrxTQip0yDPjarMB8SG41W6+SwwnagAA=",
    ],
  },
};
