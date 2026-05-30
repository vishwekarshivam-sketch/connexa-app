export type HouseKey = 'tinkerers' | 'wanderers' | 'strategists' | 'mavericks';

export interface SortingOption {
  text: string;
  house: HouseKey;
}

export interface SortingQuestion {
  text: string;
  options: SortingOption[];
}

export const SORTING_QUESTIONS: SortingQuestion[] = [
  {
    text: "It's 2am. What are you most likely doing?",
    options: [
      { text: "Debugging something I started at 10pm", house: 'tinkerers' },
      { text: "Writing in my journal or staring at the ceiling", house: 'wanderers' },
      { text: "Reading ahead for an exam that's in three weeks", house: 'strategists' },
      { text: "Still at the common room, last one standing", house: 'mavericks' },
    ],
  },
  {
    text: "Someone hands you an unassigned project. First move?",
    options: [
      { text: "Start building something — figure out the scope as I go", house: 'tinkerers' },
      { text: "Sit with it. Think about what it actually means", house: 'wanderers' },
      { text: "Make a plan, assign sub-tasks, estimate time", house: 'strategists' },
      { text: "Rope in two people and pitch them a wilder version of it", house: 'mavericks' },
    ],
  },
  {
    text: "Which of these sounds most like a good Saturday?",
    options: [
      { text: "Taking apart something to see how it works", house: 'tinkerers' },
      { text: "A long walk somewhere I haven't been", house: 'wanderers' },
      { text: "Getting ahead on the week so Sunday is free", house: 'strategists' },
      { text: "Spontaneous road trip or something that wasn't planned", house: 'mavericks' },
    ],
  },
  {
    text: "You disagree with someone in a group. What do you do?",
    options: [
      { text: "Show them a prototype or test that proves my point", house: 'tinkerers' },
      { text: "Try to understand why they think what they think first", house: 'wanderers' },
      { text: "Present the data. Let the logic win", house: 'strategists' },
      { text: "Say it directly — I'd rather have the argument than the awkwardness", house: 'mavericks' },
    ],
  },
  {
    text: "What makes you feel most like yourself?",
    options: [
      { text: "When something I made actually works", house: 'tinkerers' },
      { text: "When I'm in a real conversation, not just talking", house: 'wanderers' },
      { text: "When I've executed something exactly the way I planned", house: 'strategists' },
      { text: "When I'm doing something nobody told me to do", house: 'mavericks' },
    ],
  },
  {
    text: "Pick the thing that bothers you most:",
    options: [
      { text: "Systems that are badly designed", house: 'tinkerers' },
      { text: "People who don't really listen", house: 'wanderers' },
      { text: "Last-minute changes to a plan", house: 'strategists' },
      { text: "Being told to follow a rule that makes no sense", house: 'mavericks' },
    ],
  },
  {
    text: "In a team, you naturally end up:",
    options: [
      { text: "Building the thing while others are still talking about it", house: 'tinkerers' },
      { text: "Making sure the quieter people in the room get heard", house: 'wanderers' },
      { text: "Keeping everyone on track and knowing what's next", house: 'strategists' },
      { text: "Pushing the idea further than anyone thought it could go", house: 'mavericks' },
    ],
  },
  {
    text: "You learn best when:",
    options: [
      { text: "I can take it apart and put it back together myself", house: 'tinkerers' },
      { text: "Someone connects it to something I already care about", house: 'wanderers' },
      { text: "There's a clear structure and a logical sequence", house: 'strategists' },
      { text: "I'm thrown in and have to figure it out as I go", house: 'mavericks' },
    ],
  },
  {
    text: "Last question. What do you want people to remember about you?",
    options: [
      { text: "That I made something that actually worked", house: 'tinkerers' },
      { text: "That I really saw them", house: 'wanderers' },
      { text: "That I was someone you could count on", house: 'strategists' },
      { text: "That I made things more interesting by being there", house: 'mavericks' },
    ],
  },
];
