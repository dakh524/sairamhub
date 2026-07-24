export interface RoadmapStep {
  step: string;
  desc: string;
}

export interface VideoResource {
  title: string;
  videoId?: string;
  playList?: string;
  thumbnailId?: string;
  language: string;
}

export interface LinkResource {
  title: string;
  desc: string;
  link: string;
  icon: string;
}

export interface CategoryData {
  roadmap: RoadmapStep[];
  videos: VideoResource[];
  links: LinkResource[];
}

export const dataMap: Record<string, CategoryData> = {
  Placement: {
    roadmap: [
      { step: 'Stage 1: Quantitative Aptitude (W1-4)', desc: 'Build speed on percentages, profit/loss, time-work. Tested first in most OAs.' },
      { step: 'Stage 2: Verbal & Logical Reasoning (W3-5)', desc: 'Runs alongside quants in most online assessments.' },
      { step: 'Stage 3: Programming Fundamentals (W5-10)', desc: 'Pick ONE language, get comfortable with syntax before jumping to DSA.' },
      { step: 'Stage 4: Data Structures & Algorithms (W10-20)', desc: 'The longest, most important stage. Tested in most technical interviews.' },
      { step: 'Stage 5: Core CS Subjects (W18-24)', desc: 'OS, DBMS, CN. Needed for interviews and GATE.' },
      { step: 'Stage 6: Group Discussion Practice (W20-22)', desc: 'Practice in English right before placement season starts.' },
      { step: 'Stage 7: Resume + HR Interview (Final 2W)', desc: 'Prep for behavioral rounds and resume shortlisting.' },
    ],
    videos: [
      { title: 'Quants Foundation', playList: 'PLpyc33gOcbVA4qXMoQ5vmhefTruk5t9lt', thumbnailId: 'qFmYn82PFjE', language: 'English' },
      { title: 'Quants & Reasoning (Tamil)', playList: 'PLjk6GSlXqiZWgt5K3LP1-T7Q9zAxR1-S3', thumbnailId: 'zAKExlhKLcE', language: 'Tamil' },
      { title: 'Python Crash Course', videoId: 'vxHUFFiT0OI', language: 'English' },
      { title: 'Python (100 Days of Code)', playList: 'PLu0W_9lII9agwh1XjRt242xIpHhPT2llg', thumbnailId: 'vLqTf2b6GZw', language: 'Hindi/English' },
      { title: 'GFG Complete DSA', playList: 'PLqM7alHXFySF7JxK9E24C-ZeNAXFB1u8k', thumbnailId: '8hly31xKli0', language: 'English' },
      { title: 'Apna College DSA', playList: 'PLtjrkKJbKWfYqecn9R1bIkWuHnaBuwzzQ', thumbnailId: '5_5oE5lgrhw', language: 'Hindi/English' },
      { title: 'DBMS Complete Playlist', playList: 'PLxCzCOWd7aiFAN6I8CuViBuCdJgiOkT2Y', thumbnailId: 'kBdlM6hNDAE', language: 'English' },
      { title: 'Operating Systems Playlist', playList: 'PLxCzCOWd7aiGz9donHRrE9I3Mwn6XdP8p', thumbnailId: 'bkSWJJZNgf8', language: 'English' },
      { title: 'Computer Networks Playlist', playList: 'PLxCzCOWd7aiGFBD2-2joCpWOLUrDLvVV_', thumbnailId: 'JFF2vJaN0Cw', language: 'English' },
      { title: 'Placement Preparation Playlist', playList: 'PL6tQsxnnBiDixyITU0VzADGZwwHvz142v', thumbnailId: 'JgZlX_xRsc4', language: 'English' },
      { title: 'Top 30 HR Questions', videoId: '133r-kztF7Y', language: 'English' },
      { title: 'HR Interview Tips (Tamil)', playList: 'PLgWpUXNR_WCcT10bOhl-cORQA7YYJ5uCW', thumbnailId: '6tuFW7P9WaY', language: 'Tamil' },
    ],
    links: [
      { title: 'CS in Tamil (Channel)', desc: 'Python & CS fundamentals.', link: 'https://www.youtube.com/c/CSinTamil/playlists', icon: '💻' },
      { title: 'Tamil Coding Wizard', desc: 'DSA explained in Tamil.', link: 'https://www.youtube.com/channel/UCKOob5-7sMljgW3f4pO_Dyg/playlists', icon: '🧙‍♂️' },
      { title: 'Resume Templates', desc: 'Create a professional ATS-friendly resume.', link: 'https://novoresume.com/', icon: '📄' },
      { title: 'GeeksforGeeks Interview Prep', desc: 'HR and technical round questions.', link: 'https://www.geeksforgeeks.org/explore?page=1&category[]=Interview%20Preparation', icon: '💬' },
    ],
  },
  Aptitude: {
    roadmap: [
      { step: 'Step 1: Quants Basics', desc: 'Learn formulas for percentages, profit/loss, time/work.' },
      { step: 'Step 2: Logical Reasoning', desc: 'Practice patterns, syllogisms, and puzzles.' },
      { step: 'Step 3: Speed & Accuracy', desc: 'Solve questions under 1 minute using shortcuts.' },
      { step: 'Step 4: Mock Tests', desc: 'Take full-length mock exams regularly.' },
    ],
    videos: [
      { title: 'Equation (English)', videoId: 'qFmYn82PFjE', language: 'English' },
      { title: 'Equation (Tamil)', videoId: 'zAKExlhKLcE', language: 'Tamil' },
      { title: 'Percentage (English)', videoId: 'qwHJtfEUCgE', language: 'English' },
      { title: 'Percentage (Tamil)', videoId: '2RZaDcw4H68', language: 'Tamil' },
      { title: 'Average (English)', videoId: 'Qx73gH1kdfw', language: 'English' },
      { title: 'Average (Tamil)', videoId: 'g-_xCXSVv1w', language: 'Tamil' },
      { title: 'Ratio & Proportion (English)', videoId: 'xRLNYich5Ls', language: 'English' },
      { title: 'Ratio & Proportion (Tamil)', videoId: 'SGj_uTJ83s0', language: 'Tamil' },
      { title: 'LCM and HCF (English)', videoId: 't4b7mOdZaUI', language: 'English' },
      { title: 'LCM and HCF (Tamil)', videoId: 's0v-JGen6C0', language: 'Tamil' },
      { title: 'Number System (English)', videoId: 'qwHJtfEUCgE', language: 'English' },
      { title: 'Number System (Tamil)', videoId: 'aT9gStcGvnc', language: 'Tamil' },
      { title: 'Profit and Loss (English)', videoId: 'frDUnX_rFP4', language: 'English' },
      { title: 'Profit and Loss (Tamil)', videoId: 'w2xM8vgqYlQ', language: 'Tamil' },
      { title: 'Discount (English)', videoId: 'oHj6_NWvYV8', language: 'English' },
      { title: 'Discount (Tamil)', videoId: 'K83TNFowMEU', language: 'Tamil' },
      { title: 'Problems on Ages (English)', videoId: 'viKaYznFJbw', language: 'English' },
      { title: 'Problems on Ages (Tamil)', videoId: '6tuFW7P9WaY', language: 'Tamil' },
      { title: 'Simple Interest (English)', videoId: 'B7VqoXjoHPk', language: 'English' },
      { title: 'Compound Interest (English)', videoId: 't8D38-cdlRA', language: 'English' },
      { title: 'Time and Work (English)', videoId: 'RhCwy2j2pHY', language: 'English' },
      { title: 'Time and Work (Tamil)', videoId: 'AcOIUsKhlFM', language: 'Tamil' },
      { title: 'Alligation and Mixture (English)', videoId: 'PQ8ux_3hdT4', language: 'English' },
      { title: 'Alligation and Mixture (Tamil)', videoId: '7j_1EuneZ_c', language: 'Tamil' },
      { title: 'Time and Distance (English)', videoId: 'ufbDCFUn6PY', language: 'English' },
      { title: 'Time and Distance (Tamil)', videoId: 'lFHjNbSmsCE', language: 'Tamil' },
      { title: 'Races (English)', videoId: 'ZVWTCzPfIzQ', language: 'English' },
      { title: 'Races (Tamil)', videoId: '0kZUlZ6Ypzs', language: 'Tamil' },
      { title: 'Problems on Train (English)', videoId: 'tZ2eRwVF-tM', language: 'English' },
      { title: 'Boats and Streams (English)', videoId: 'Agnaf5cv9lY', language: 'English' },
      { title: 'Boats and Streams (Tamil)', videoId: 'BLNmaB_V5Hk', language: 'Tamil' },
      { title: 'Permutation (English)', videoId: '6B-dvOMTeV8', language: 'English' },
      { title: 'Permutation (Tamil)', videoId: 'HrPyIdM4D8I', language: 'Tamil' },
      { title: 'Combination (English)', videoId: 'VSoJwlYdCWM', language: 'English' },
      { title: 'Combination (Tamil)', videoId: 'SS4xYuMPbmo', language: 'Tamil' },
      { title: 'Probability (English)', videoId: 'KOEEZn2xR3k', language: 'English' },
      { title: 'Probability (Tamil)', videoId: 'MnnKMTUmHUo', language: 'Tamil' },
      { title: 'Caselets (English)', videoId: 'VpyHoyfMDi0', language: 'English' },
      { title: 'Set Theory (English)', videoId: 'EbWR7DVUqpg', language: 'English' },
      { title: 'Height and Distance (English)', videoId: 'p1UdFCAEAV8', language: 'English' },
      { title: 'Height and Distance (Tamil)', videoId: '52kultJjT0Y', language: 'Tamil' },
      { title: 'Clock (English)', videoId: '_up3mXnsVEc', language: 'English' },
      { title: 'Clock (Tamil)', videoId: 'ZsW4sfgUgrs', language: 'Tamil' },
      { title: 'Calendar (English)', videoId: 'hGFGybSQDxQ', language: 'English' },
      { title: 'Calendar (Tamil)', videoId: 'HRHXjhx2sVg', language: 'Tamil' },
      { title: 'Partnership (English)', videoId: 'vk5RyHTX8wA', language: 'English' },
      { title: 'Partnership (Tamil)', videoId: 'SwaGAsTTZV4', language: 'Tamil' },
      { title: 'Algebra (English)', videoId: 'MWZpzmrE8lI', language: 'English' },
      { title: 'Trigonometry (English)', videoId: 'zApfhBgQd_Y', language: 'English' },
      { title: 'Rectangle (English)', videoId: 'I6W2onPbjGg', language: 'English' },
      { title: 'Triangles (English)', videoId: 'MOXVNUqNNwM', language: 'English' },
      { title: 'Cube & Cuboid (English)', videoId: '8peJxO7KnTs', language: 'English' },
      { title: 'Cube & Cuboid (Tamil)', videoId: 'WuvL7G8zg8o', language: 'Tamil' },
      { title: 'Circle (English)', videoId: 'KtbzlUo3F-Y', language: 'English' },
      { title: 'Circle (Tamil)', videoId: 'RORF7YrI-OY', language: 'Tamil' },
      { title: 'How Many Triangles? (English)', videoId: '0bOsOT2Bsyw', language: 'English' },
    ],
    links: [
      { title: 'IndiaBix Quants', desc: 'Quantitative aptitude practice.', link: 'https://www.indiabix.com/aptitude/questions-and-answers/', icon: '📈' },
      { title: 'IndiaBix Reasoning', desc: 'Logical reasoning practice.', link: 'https://www.indiabix.com/logical-reasoning/questions-and-answers/', icon: '🧩' },
      { title: 'PrepInsta Tests', desc: 'Mock assessment papers.', link: 'https://prepinsta.com/', icon: '📝' },
    ],
  },
  Coding: {
    roadmap: [
      { step: 'Step 1: Learn a Language', desc: 'Master C++, Java, or Python syntax and OOPs.' },
      { step: 'Step 2: Data Structures', desc: 'Understand Arrays, Linked Lists, Trees, Graphs.' },
      { step: 'Step 3: Algorithms', desc: 'Learn Sorting, Searching, DP, and Greedy.' },
      { step: 'Step 4: LeetCode/GFG', desc: 'Practice top 100 interview coding questions.' },
    ],
    videos: [
      { title: 'CodeWithHarry Python Crash Course', videoId: 'vxHUFFiT0OI', language: 'English' },
      { title: 'Apna College Python - 100 Days of Code', playList: 'PLu0W_9lII9agwh1XjRt242xIpHhPT2llg', thumbnailId: '7wnove7K-ZQ', language: 'English' },
      { title: 'DSA in Python - Jovian', playList: 'PLyMom0n-MBrpakdIZvnhd6PFUCKNAyKo1', thumbnailId: 'clTW4lydwOU', language: 'English' },
      { title: 'Apna College C Language', videoId: 'irqbmMNs2Bo', language: 'English' },
      { title: 'CodeWithHarry C Language', videoId: 'ZSPZob_1TOk', language: 'English' },
      { title: 'Apna College C++ & DSA', playList: 'PLfqMhTWNBTe137I_EPQd34TsgV6IO55pt', thumbnailId: 'VTLCoHnyACE', language: 'English' },
      { title: 'CodeHelp by Babbar - C++ DSA', playList: 'PLDzeHZWIZsTryvtXdMr6rPh4IDexB5NIA', thumbnailId: 'WQoB2z67hvY', language: 'English' },
      { title: 'CodeWithHarry DSA', playList: 'PLu0W_9lII9ahIappRPN0MCAgtOu3lQjQi', thumbnailId: '5_5oE5lgrhw', language: 'English' },
      { title: 'Kunal Kushwaha - Java OOP', playList: 'PL9gnSGHSqcno1G3XjUbwzXHL8_EttOuKk', thumbnailId: 'BSVKUk58K6U', language: 'English' },
      { title: 'GeeksforGeeks Complete DSA', playList: 'PLqM7alHXFySF7JxK9E24C-ZeNAXFB1u8k', thumbnailId: 'rlZpZ8es_6k', language: 'English' },
      { title: 'DSA Tutorial in Tamil', playList: 'PLIFRUdRwOM094mR0WU6x-ghbJocYpo0rY', thumbnailId: 'qK95GNgX-Ag', language: 'Tamil' },
      { title: 'DBMS Complete Playlist', playList: 'PLxCzCOWd7aiFAN6I8CuViBuCdJgiOkT2Y', thumbnailId: 'kBdlM6hNDAE', language: 'English' },
      { title: 'Operating System Complete Playlist', playList: 'PLxCzCOWd7aiGz9donHRrE9I3Mwn6XdP8p', thumbnailId: 'bkSWJJZNgf8', language: 'English' },
      { title: 'Computer Networks Complete Playlist', playList: 'PLxCzCOWd7aiGFBD2-2joCpWOLUrDLvVV_', thumbnailId: 'JFF2vJaN0Cw', language: 'English' },
      { title: 'Digital Electronics - Neso Academy', playList: 'PLE-RdVsYEV0v8uzhal0VnDDrhz-WmhF44', thumbnailId: 'M0mx8S05v60', language: 'English' },
      { title: 'GATE CSE Playlist', playList: 'PLjtABWoJmNO2UwhmKy_ZyQCWP56BwN4p8', thumbnailId: 'bKu9VB8_vX4', language: 'English' },
      { title: 'Placement Preparation', playList: 'PL6tQsxnnBiDixyITU0VzADGZwwHvz142v', thumbnailId: 'ZLUYXfYHRwU', language: 'English' },
      { title: 'Apna College Git & GitHub', videoId: 'Ez8F0nW6S-w', language: 'English' },
      { title: 'Java Collections Framework', videoId: 'rzA7UJ-hQn4', language: 'English' },
      { title: 'Java One-Shot Overview', videoId: 'UmnCZ7-9yDY', language: 'English' },
      { title: 'EMC JavaScript Full Course', videoId: 'poo0BXryffI', language: 'Tamil' },
      { title: 'EMC HTML Full Tutorial', videoId: 'FYErehuSuuw', language: 'Tamil' },
      { title: 'EMC Front End Web Dev', videoId: '7dSJubxFWv0', language: 'Tamil' },
      { title: 'EMC Python Full Course', videoId: 'm67-bOpOoPU', language: 'Tamil' },
      { title: 'JS Basic to Advanced', videoId: 'NWHluLBZX9Q', language: 'Tamil' },
      { title: 'Logic First Tamil JS', videoId: 'bHExCmA65pY', language: 'Tamil' },
      { title: 'Tutor Joes JS Complete', videoId: 'dBUBYz75gdk', language: 'Tamil' }
    ],
    links: [
      { title: 'Take U Forward (Striver)', desc: 'All playlists for DSA.', link: 'https://www.youtube.com/channel/UCJskGeByzRRSvmOyZOz61ig/playlists', icon: '📺' },
      { title: 'CS in Tamil', desc: 'Coding channels in Tamil.', link: 'https://www.youtube.com/c/CSinTamil/playlists', icon: '📺' },
      { title: 'Tamil Coding Wizard', desc: 'React, JS, Full-stack in Tamil.', link: 'https://www.youtube.com/channel/UCKOob5-7sMljgW3f4pO_Dyg/playlists', icon: '📺' },
      { title: "Striver's A2Z DSA Sheet", desc: 'Complete DSA study material.', link: 'https://takeuforward.org/dsa/strivers-a2z-sheet-learn-dsa-a-to-z', icon: '📄' },
      { title: "Striver's SDE Sheet", desc: 'Top interview questions.', link: 'https://takeuforward.org/interviews/strivers-sde-sheet-top-coding-interview-problems/', icon: '📄' },
      { title: 'Error Makes Clever', desc: 'Coding tutorials in Tamil.', link: 'https://www.youtube.com/@ErrorMakesClever', icon: '📺' }
    ],
  },
  GATE: {
    roadmap: [
      { step: 'Step 1: Syllabus Analysis', desc: 'Understand the weightage of each subject.' },
      { step: 'Step 2: Concept Building', desc: 'Study standard textbooks and notes.' },
      { step: 'Step 3: PYQs', desc: 'Solve Previous Year Questions extensively.' },
      { step: 'Step 4: Test Series', desc: 'Analyze mistakes through mock tests.' },
    ],
    videos: [
      { title: 'GATE Preparation Strategy', videoId: '5pIe3QO863w', language: 'English' },
      { title: 'Gate Smashers DBMS (CSE)', playList: 'PLxCzCOWd7aiFAN6I8CuViBuCdJgiOkT2Y', thumbnailId: 'kBdlM6hNDAE', language: 'Hindi/English' },
      { title: 'Gate Smashers OS (CSE)', playList: 'PLxCzCOWd7aiGz9donHRrE9I3Mwn6XdP8p', thumbnailId: 'bkSWJJZNgf8', language: 'Hindi/English' },
      { title: 'Gate Smashers CN (CSE)', playList: 'PLxCzCOWd7aiGFBD2-2joCpWOLUrDLvVV_', thumbnailId: 'JFF2vJaN0Cw', language: 'Hindi/English' },
      { title: 'GFG Complete DSA', playList: 'PLqM7alHXFySF7JxK9E24C-ZeNAXFB1u8k', thumbnailId: '8hly31xKli0', language: 'English' },
      { title: 'Apna College DSA', playList: 'PLtjrkKJbKWfYqecn9R1bIkWuHnaBuwzzQ', thumbnailId: '5_5oE5lgrhw', language: 'Hindi/English' },
      { title: 'Neso Digital Electronics (ECE/EE)', playList: 'PLE-RdVsYEV0v8uzhal0VnDDrhz-WmhF44', thumbnailId: 'XoK0O3z5ZfE', language: 'English' },
    ],
    links: [
      { title: 'Neso Academy Playlists (ECE/EE)', desc: 'Signals & Systems, Analog Circuits, Network Analysis.', link: 'https://www.youtube.com/c/nesoacademy/playlists', icon: '🔌' },
      { title: 'NPTEL Official Channel', desc: 'IIT/IISc lectures covering every single branch (Mech/Civil).', link: 'https://www.youtube.com/@nptelhrd', icon: '📺' },
      { title: 'DBMS Notes PDF', desc: 'Community compiled DBMS Notes (Drive).', link: 'https://drive.google.com/file/d/1XGU4dusm9IV2DzBnuKhrrM_o7hUIt7NT/view', icon: '📓' },
      { title: 'Operating System Notes PDF', desc: 'Community compiled OS Notes (Drive).', link: 'https://drive.google.com/file/d/1Qpc_gzY-M0mCLU9Nm6rZdycOkqvHBYPD/view', icon: '📓' },
      { title: 'GATE Overflow', desc: 'Previous year questions and discussions.', link: 'https://gateoverflow.in/', icon: '📦' },
    ],
  },
};
