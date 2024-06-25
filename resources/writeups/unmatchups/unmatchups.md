<br>

<div class="centered wide banner shadow">
  <img src="resources/writeups/unmatchups/example.png" alt="Banner">
</div>

What makes [Unmatched](https://restorationgames.com/unmatched/) special as a game, is that there are a high variety of heroes and decks, and they can all be mixed and matched to create a vast amount of matchups and scenarios. As my friend and I became increasingly interested with this game, we started getting curious about stats for the different matchups. While some fan-made sites ([Unmatched Maker](https://unmatched.cards)) exist, where players can (and do) track their plays, in order to receive matchup statistics, the site is a bit clunky and the data is not presented very intuitively. 

**This project is grounded in the idea of turning this data into our own user-centric site**, with a multitude of features such as seeing matchups for heroes in intuitive, aesthetic and useful ways, generating balanced matchups from the sets the users own, seeing play trends as new sets release, and more. 

<details>
  <summary>
    <h2>About the Game</h2>
  </summary><br>

From [BoardGameGeek](https://boardgamegeek.com/boardgame/295564/unmatched-game-system): "Unmatched is a highly asymmetrical miniature fighting game for two or four players. Each hero is represented by a unique deck designed to evoke their style and legend. Tactical movement and no-luck combat resolution create a unique play experience that rewards expertise, but just when you've mastered one set, new heroes arrive to provide all new match-ups."

<hr></details>

<details open>
  <summary>
    <h2>Select Grid</h2>
  </summary><br>

The select grid is a core function of the site. It offers a quick view of all available heroes, which, upon clicking, open a hero stats page (WIP) for each hero, showing some of their basic info, like what type of fighter they are, as well as how they fare against other heroes, amongst other things. Ensuring a smooth user experience is vital for this component. As this project is built on the [React framework](https://react.dev), this was built as a React component.

<details open>
  <summary>
    <h3>Animation to Hero Stats Page</h3>
  </summary><br>

One of the ideas was to make all the hero thumbnails flip away when a hero is selected, from top left to bottom right, with a slight delay between each, before bringing in the hero stats page. This turned out to have a few small challenges in implementation.

<div class="image-container inline-right">
  <img src="resources/writeups/unmatchups/grid-animation-1.gif" alt="Grid transition to hero stats page">
</div>

Firstly, we wanted the first hero of the grid to flip away first, then with a slight delay, say 50ms, the next hero, and so forth, until all the heroes (except the selected one) had disappeared. However, if the user had already scrolled down a bit on the grid, this caused the first actually visible hero in the viewport (the visible area of the browser), to only disappear after all the ones before, that were not visible to the user, had disappeared. Say 8 heroes were outside the viewport, above the currently visible heroes, then the first visible hero would only disappear after 8*50ms=200ms. Therefore, we made it so all the heroes that are before the first visible hero in the grid flip away immediately, causing instant feedback for the user, and a smooth animation. To achieve this, we go through the full list of the grid, from top left to bottom right, and assign a delay based on the position, but not increasing the delay in case the element is outside the viewport.

<div class="code-snippet no-link" csname="SelectGrid.tsx">⠀</div>

```tsx
const animateCascadingFlip = () => {
  const selectElement = document.getElementById(`select-${props.heroes[id]}`);
  let delay = 0;
  items.forEach((item) => {
    delay += isElementInViewport(selectElement) ? 50 : 0;
    setTimeout(() => selectElement?.classList.add('flip'));
  });
};
```

<div class="image-container inline-left">
  <img src="resources/writeups/unmatchups/grid-animation-2.gif" alt="Grid transition to hero stats page while scrolling">
</div>

Secondly, we wanted heroes that are further down than where the user is scrolled to naturally continue flipping, but also not keep extending the delays if the user didn't scroll down. In other words, if the user stayed perfectly still, we wanted those heroes to disappear immediately, but if the user scrolled down, the flipping should naturally continue with those images. Currently, since they are outside the viewport, they would disappear with the same delay as the last hero in the viewport, so simultaneously with the last hero. Since this delay was set as soon as the user clicked, this would result in weird behavior when scrolling down after having selected a hero, where the heroes would still be visible, but then suddenly all disappear at the same time. To solve this, we changed the function to be recursive, so that only at the end of each timeout will the next element be checked for whether it is in the viewport, meaning the decision for its delay are done at the last possible moment, resulting in the expected behaviour.

<div class="code-snippet no-link" csname="SelectGrid.tsx">⠀</div>

```tsx
const animateCascadingFlipRecursive = (id: number) => {
  if (id == items.length) return;
  const selectElement = document.getElementById(`select-${props.heroes[id]}`);
  if (isElementInViewport(selectElement))
    setTimeout(() => {
      selectElement?.classList.add('flip');
      animateCascadingFlipRecursive(id + 1);
    }, 50);
};
```

While this got all the basic functionality, there was still something slightly wrong. Due to the `setTimeout()` function being called even for delay 0, the actions would complete asynchronously in one of the next render frames, causing a slight delay when scrolled down on the page. To fix this, we simply made anything with delay 0 not call `setTimeout()` anymore, resulting in the following final function.

<div class="code-snippet no-link" csname="SelectGrid.tsx">⠀</div>

```tsx
const animateCascadingFlipRecursive = (id: number) => {
  if (id == itemslength) return;
  const selectElement = document.getElementById(`select-${props.heroes[id]}`);
  const flip = () => {
    selectElement?.classList.add('flip');
    animateCascadingFlipRecursive(id + 1);
  };
  if (isElementInViewport(selectElement))
    setTimeout(flip, 50);
  else flip();
};
```

Ultimately, while these issues were not huge, and were easy enough to fix, it shows the importance of considering the user experience, and how they might interact with the website, in order to ensure the appropriate and intended behavior of the product. 

</details>

<hr></details>

