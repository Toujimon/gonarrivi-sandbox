import React, { useState } from "react";
import { StyledBox, StyledButton } from "./components/design-system";

export default function AdventOfCode({ match, story }) {
  return (
    <React.Fragment>
      <h2>Advent of Code</h2>
      <p>
        <b>
          <a href="https://adventofcode.com/" target="_blank">
            Advent of Code
          </a>
        </b>
        is a set of challenges for coders for the last month of the year, to
        celebrate our coding passion in the most dorkly way.
      </p>
      <p>
        Here you can get the answers for each day puzzle using my proposed
        solutions.
      </p>
      <AdventOfCode2018 />
    </React.Fragment>
  );
}

function AdventOfCode2018(props) {
  const weblink = "https://adventofcode.com/2018";
  return (
    <StyledBox>
      <h3>2018</h3>
      <p>
        <a target="_blank" href={weblink}>
          Website
        </a>
      </p>
      {[year2018Day01, year2018Day02].map((dayFunc, i) => (
        <Day key={i} day={i + 1} weblink={weblink} calculateResults={dayFunc} />
      ))}
    </StyledBox>
  );
}
function year2018Day01(input) {
  // day 1
  // The fist value is the sum of all the values of the input
  input = input
    .trim()
    .split("\n")
    .map(Number);
  const day01a = input.reduce((acc, value) => acc + value, 0);
  // The second value is the first freq reached twice
  const timestamp = new Date().getTime();
  let timeout = false;
  let loopFreqs = {};
  const freqs = [loopFreqs];
  let curFreq = 0;
  let index = 0;
  const length = input.length;
  try {
    while (!freqs.some(someFreqs => someFreqs[curFreq + ""])) {
      const ellapsedTime = new Date().getTime() - timestamp;
      if (ellapsedTime > 10000) {
        timeout = true;
        console.log("timeout", { curFreq, index });
        break;
      }
      loopFreqs[curFreq + ""] = true;
      curFreq += input[index];
      index = (index + 1) % length;
      if (index === 0) {
        loopFreqs = {};
        freqs.push(loopFreqs);
      }
    }

    const day01b = timeout ? "timeout" : curFreq;
    return [day01a, day01b];
  } catch (e) {
    console.error(e);
  }
}

function year2018Day02(input) {
  try {
    // day 2
    // The fist value is the product of the amount of
    // values with exactly 2 identical letters on it and the
    // amount of values with 3 identical letters on it
    input = input.trim().split("\n");
    const [twos, threes] = input.reduce(
      ([twos, threes], value) => {
        const [twosSet, threesSet] = Array.from(value).reduce(
          ([twosSet, threesSet, lettersCount], letter) => {
            const newCount = (lettersCount[letter] || 0) + 1;
            lettersCount[letter] = newCount;
            if (newCount === 2) {
              twosSet.add(letter);
            } else if (newCount === 3) {
              twosSet.delete(letter);
              threesSet.add(letter);
            } else if (newCount === 4) {
              threesSet.delete(letter);
            }
            return [twosSet, threesSet, lettersCount];
          },
          [new Set(), new Set(), {}]
        );
        return [twos + (twosSet.size > 0), threes + (threesSet.size > 0)];
      },
      [0, 0]
    );
    const a = twos * threes;
    // The second value is the commons letters between the
    // only two values that differ on exactly just one letter
    // in the same position
    let found = null;
    let initialPossibleValues = new Map();
    initialPossibleValues.set("", input);
    for (
      let diffLetterIndex = 0, maxLength = input[0].length;
      diffLetterIndex < maxLength;
      diffLetterIndex++
    ) {
      let possibleValues = initialPossibleValues;
      for (
        let index = Math.max(0, diffLetterIndex - 1);
        possibleValues.size && index < maxLength;
        index++
      ) {
        if (index !== diffLetterIndex) {
          const newPossibleValues = new Map();
          for (const [key, possibleValues] of possibleValues.entries()) {
            const keyCounterMap = new Map();
            for (let possibleValue of possibleValues) {
              const newKey = key + possibleValue[index];
              const accWithNewKey = [
                ...(keyCounterMap.get(newKey) || []),
                possibleValue
              ];
              keyCounterMap.set(newKey, accWithNewKey);
              if (accWithNewKey.length > 1) {
                newPossibleValues.set(newKey, accWithNewKey);
              }
            }
          }
          possibleValues = newPossibleValues;
          if (index < diffLetterIndex) {
            initialPossibleValues = possibleValues;
          }
        }
      }
      if (possibleValues.size) {
        if (possibleValues.size === 1) {
          const key = [...possibleValues.keys()][0];
          if (possibleValues.get(key).length === 2) {
            found = key;
          } else {
            console.log(
              "More than one value with the key",
              possibleValues.get(key)
            );
          }
        } else {
          console.log(
            "More than one key found",
            JSON.stringify([...possibleValues.entries()])
          );
        }
      }
    }
    const b = found || "not found";
    return [a, b];
  } catch (e) {
    console.error(e);
  }
}

function Day({ weblink, day, calculateResults }) {
  const [input, setInput] = useState(null);
  function handleInputSubmit(e) {
    e.preventDefault();
    const input = (e.currentTarget["input"].value || "").trim();
    if (input) {
      setInput(input);
    }
  }
  function handleInputReset(e) {
    setInput(null);
  }
  const results = input && calculateResults(input);
  return (
    <StyledBox compact separation={4}>
      <h4>Day {day}</h4>
      <p>
        <a target="_blank" href={`${weblink}/day/${day}`}>
          Description
        </a>
      </p>
      {input ? (
        <StyledBox compact>
          <p>
            Answer/s: <br />
          </p>
          <ol type="a">
            {results.map((result, index) => (
              <li key={index}>{result}</li>
            ))}
          </ol>
          <p>
            <StyledButton onClick={handleInputReset}>
              Provide new input
            </StyledButton>
          </p>
        </StyledBox>
      ) : (
        <StyledBox compact as="form" onSubmit={handleInputSubmit}>
          <span>Provide your input:</span>
          <textarea name="input" />
          <span>
            <StyledButton primary type="submit">
              Submit
            </StyledButton>
          </span>
        </StyledBox>
      )}
    </StyledBox>
  );
}
