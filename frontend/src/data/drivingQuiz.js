// Original educational questions. Exam-topic items paraphrase stable concepts
// from DoTM's category B collection (2078); these are not an official exam paper.
export const QUIZ_SOURCES = {
  collection: 'https://giwmscdnone.gov.np/media/files/Category%20B%20English%20Question%20Collection_67ohtqu.pdf',
  current: 'https://sirahatmo.dotm.gov.np/MainData/AboutDrivingLicense',
};
const q = (topic, question, options, correct, explanation, exam = false) => ({ topic, question, options, correct, explanation, exam });
export const DRIVING_QUESTIONS = [
  q('Road rules', 'For normal travel in Nepal, which side should you keep to?', ['Left', 'Right', 'Either side', 'Centre of the road'], 0, 'Nepal uses left-hand traffic. Follow lane markings and traffic directions.', true),
  q('Road rules', 'A person is using a zebra crossing. What should you do?', ['Sound the horn and continue', 'Give the pedestrian priority', 'Accelerate past them', 'Overtake the stopped vehicle'], 1, 'Slow down and give people crossing priority. Keep the crossing clear.', true),
  q('Road rules', 'An ambulance needs to pass. What is the best response?', ['Race ahead', 'Follow it closely', 'Make space safely and let it pass', 'Block the lane'], 2, 'Check surrounding traffic and safely give way to the emergency vehicle.', true),
  q('Vehicle checks', 'The car ahead shows its brake lights. What should you expect?', ['It may be slowing or stopping', 'It is asking you to overtake', 'It is accelerating', 'Its fuel tank is empty'], 0, 'Brake lights warn following drivers to prepare to slow down.', true),
  q('Road rules', 'What does an L displayed on a vehicle tell you?', ['It carries luggage', 'It is a learner vehicle', 'It has a large engine', 'It must turn left'], 1, 'Allow extra space and patience around learner drivers.', true),
  q('Road rules', 'Before turning, which combination is safest?', ['Signal only', 'Slow only', 'Look only', 'Check traffic, signal, and slow appropriately'], 3, 'A safe turn needs observation, a timely signal, and controlled speed.', true),
  q('Signs & signals', 'A red traffic light is showing. Where should you stop?', ['On the crossing', 'Beyond the junction', 'Before the stop line', 'Anywhere after turning'], 2, 'Stop before the line and keep the pedestrian crossing clear.'),
  q('Signs & signals', 'An amber light appears as you approach. What should you do?', ['Speed up', 'Stop if you can do so safely', 'Overtake', 'Always brake suddenly'], 1, 'Prepare to stop. Avoid accelerating to beat the signal or braking dangerously.'),
  q('Signs & signals', 'The light turns green but the junction is blocked. What should you do?', ['Enter and wait inside', 'Use the pavement', 'Keep sounding the horn', 'Wait until there is space to clear it'], 3, 'A green signal does not make a blocked junction safe to enter.'),
  q('Signs & signals', 'What does a STOP sign require?', ['A complete stop and a check before proceeding', 'A quick horn blast', 'Slowing without stopping', 'Stopping only at night'], 0, 'Stop fully, check for pedestrians and traffic, then proceed when safe.'),
  q('Signs & signals', 'What does a Give Way sign ask you to do?', ['Claim priority', 'Yield to priority traffic, stopping when necessary', 'Always reverse', 'Park nearby'], 1, 'Reduce speed and allow priority traffic to pass before entering.'),
  q('Signs & signals', 'A No Entry sign faces your vehicle. What should you do?', ['Enter slowly', 'Enter if the road is empty', 'Use another permitted route', 'Enter with hazard lights'], 2, 'Do not enter from that direction; choose a permitted route.'),
  q('Signs & signals', 'A school-area warning sign appears. What is safest?', ['Expect children and reduce speed', 'Accelerate before school closes', 'Ignore it outside rush hour', 'Overtake near the gate'], 0, 'Children may enter the road unexpectedly. Be ready to stop.'),
  q('Signs & signals', 'A No Overtaking sign is displayed. What should you do?', ['Pass if you sound the horn', 'Pass on a bend', 'Pass with headlights', 'Remain behind and obey the restriction'], 3, 'The restriction warns that passing is prohibited on that stretch.'),
  q('Road rules', 'Before changing lanes, what should you check?', ['Only the speedometer', 'Mirrors, blind spot, and a safe gap', 'Only the horn', 'Only the vehicle ahead'], 1, 'Signal in good time and move only after checking mirrors and the blind spot.'),
  q('Road rules', 'When is overtaking especially unsafe?', ['On a clear straight road', 'With a wide view ahead', 'Near a blind bend or crest', 'After a full safety check'], 2, 'Hidden oncoming traffic leaves too little time to avoid a collision.'),
  q('Road rules', 'How should your following gap change in heavy rain?', ['Increase it', 'Reduce it', 'Stay bumper to bumper', 'It does not matter'], 0, 'Wet roads reduce grip and can increase stopping distance.'),
  q('Road rules', 'Your phone rings while driving. What should you do?', ['Read it quickly', 'Hold it below the window', 'Text at the next bend', 'Stop in a safe permitted place before using it'], 3, 'Phone use distracts your eyes, hands, and attention from driving.'),
  q('Road rules', 'You feel sleepy on a long journey. What is safest?', ['Open a window and continue indefinitely', 'Stop safely and rest', 'Drive faster', 'Follow another vehicle closely'], 1, 'Fatigue reduces attention. Take a proper break rather than trying to push through.'),
  q('Road rules', 'When should occupants put on their seat belts?', ['Before the vehicle moves', 'Only near police', 'Only on highways', 'Only after a collision'], 0, 'Use available seat belts properly throughout the journey.'),
  q('Motorcycle safety', 'How should a helmet be worn?', ['Loose and unfastened', 'Hanging from the handlebar', 'Correctly fitted with the strap secured', 'Only resting on the head'], 2, 'A secure, well-fitting helmet is more likely to stay in place during a crash.'),
  q('Motorcycle safety', 'A pillion passenger should use which protection?', ['A cap', 'A properly fitted, fastened helmet', 'Only sunglasses', 'No protection on short trips'], 1, 'Passengers also need head protection, even on short journeys.'),
  q('Motorcycle safety', 'How should you approach a slippery bend?', ['Brake hard while leaning', 'Accelerate sharply', 'Close your eyes briefly', 'Reduce speed beforehand and use smooth controls'], 3, 'Abrupt braking or acceleration while leaning can cause loss of grip.'),
  q('Motorcycle safety', 'Why avoid riding alongside a large vehicle?', ['You may be hidden in its blind spot', 'It makes your fuel last longer', 'It improves your visibility', 'It guarantees priority'], 0, 'Large vehicles have significant blind spots. Keep space and stay visible.'),
  q('Motorcycle safety', 'Before riding with a passenger, what should you consider?', ['Only the horn volume', 'Only the paint colour', 'Secure seating and the effect on balance and braking', 'Nothing changes'], 2, 'Extra weight changes handling and stopping distance; ride smoothly and allow space.'),
  q('Vehicle checks', 'Which checks are useful before setting off?', ['Only the radio', 'Tyres, brakes, lights, and mirrors', 'Only the registration colour', 'Only the seat fabric'], 1, 'Basic checks help catch faults before they create danger on the road.'),
  q('Vehicle checks', 'A tyre has very little tread. What is the concern?', ['Better wet-road grip', 'Quieter horn', 'More reliable brakes', 'Reduced grip, especially in rain'], 3, 'Worn tread makes it harder for tyres to maintain traction on wet surfaces.'),
  q('Vehicle checks', 'The oil-pressure warning stays on while driving. What should you do?', ['Stop safely and have the problem checked', 'Ignore it until next month', 'Accelerate harder', 'Cover the warning lamp'], 0, 'Continuing with low oil pressure can damage the engine. Follow the vehicle manual.'),
  q('Vehicle checks', 'Why adjust mirrors before starting?', ['To see passengers only', 'To decorate the vehicle', 'To improve the view of traffic behind and beside you', 'To remove all blind spots completely'], 2, 'Mirrors help observation, but blind-spot checks are still needed.'),
  q('Vehicle checks', 'Which driving habit can reduce unnecessary fuel use?', ['Repeated harsh acceleration', 'Smooth acceleration and anticipation', 'Long unnecessary idling', 'Driving with underinflated tyres'], 1, 'Smooth driving and anticipating stops reduce wasted fuel and abrupt manoeuvres.'),
  q('Emergencies', 'You arrive at a road crash. What is the first priority?', ['Take a close-up video', 'Move every injured person immediately', 'Stand in moving traffic', 'Keep yourself and others safe and call for help'], 3, 'Avoid creating another crash. Alert emergency services and give a clear location.'),
  q('Emergencies', 'Should you move an injured person after a crash?', ['Only if immediate danger makes it necessary or trained help directs you', 'Always pull them to their feet', 'Always remove their helmet', 'Move them for a better photograph'], 0, 'Unnecessary movement can worsen injuries. Seek trained help and avoid immediate hazards.'),
  q('Emergencies', 'Visibility becomes too poor to continue safely. What should you do?', ['Speed up to escape the weather', 'Follow tail lights closely', 'Slow down and stop in a safe place if necessary', 'Stop in the middle of the lane'], 2, 'Use suitable lights, increase space, and stop clear of traffic when safe driving is impossible.'),
  q('Emergencies', 'On a steep descent, which approach helps control speed?', ['Coast in neutral', 'Use an appropriate lower gear and controlled braking', 'Switch off the engine', 'Keep accelerating'], 1, 'Engine braking helps control speed; avoid coasting and overheating brakes.'),
  q('Emergencies', 'If a tyre suddenly deflates while moving, what is safest?', ['Turn sharply', 'Brake as hard as possible immediately', 'Accelerate', 'Hold the steering firmly and slow gradually to stop safely'], 3, 'Abrupt steering or braking may destabilise the vehicle. Maintain control and slow smoothly.'),
  q('Emergencies', 'What information helps when reporting a crash?', ['The location, hazards, and number of people needing help', 'Only the vehicle colour', 'Your favourite route', 'Unverified blame'], 0, 'Clear details help responders find the scene and prepare appropriate assistance.'),
];

export function createPracticeSet(topic = 'All topics') {
  const pool = DRIVING_QUESTIONS.filter(question => topic === 'All topics' || question.topic === topic);
  const shuffled = [...pool];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, 10);
}
