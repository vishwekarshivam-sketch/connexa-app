export interface IntroductionCard {
  id: string;
  displayName: string;
  memberNo: number;
  iit: string;
  branch: string;
  initials: string;
  promptAnswer: string;
}

export const INTRODUCTION_CARDS: IntroductionCard[] = [
  { 
    id: '1', 
    displayName: 'Riya Verma', 
    memberNo: 18, 
    iit: 'IITB', 
    branch: 'Computer Science', 
    initials: 'RV', 
    promptAnswer: 'I taught myself to solder at 14 using YouTube and a broken transistor radio. Never fixed the radio.' 
  },
  { 
    id: '2', 
    displayName: 'Arjun Mehta', 
    memberNo: 34, 
    iit: 'IIT Delhi', 
    branch: 'Electrical Engineering', 
    initials: 'AM', 
    promptAnswer: "The best conversations I've had started with a question I didn't know how to ask." 
  },
  { 
    id: '3', 
    displayName: 'Priya Nair', 
    memberNo: 7, 
    iit: 'IITB', 
    branch: 'Engineering Physics', 
    initials: 'PN', 
    promptAnswer: 'I once spent three days trying to prove a theorem that was already proven. Worth it.' 
  },
];
