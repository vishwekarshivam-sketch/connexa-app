export interface DiscoverProfile {
  id: string;
  displayName: string;
  memberNo: number;
  iit: string;
  branch: string;
  initials: string;
  promptAnswer: string;
}

export const DISCOVER_PROFILES: DiscoverProfile[] = [
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
  { 
    id: '4', 
    displayName: 'Karan Singh', 
    memberNo: 52, 
    iit: 'IIT Kanpur', 
    branch: 'Mathematics & Computing', 
    initials: 'KS', 
    promptAnswer: 'My best ideas come at 2am. My worst decisions also come at 2am.' 
  },
  { 
    id: '5', 
    displayName: 'Ananya Roy', 
    memberNo: 23, 
    iit: 'IITB', 
    branch: 'Chemical Engineering', 
    initials: 'AR', 
    promptAnswer: "I make playlists for situations that haven't happened yet." 
  },
];
