export const HOBBY_STATUSES = ['Заблокировано', 'В процессе', 'Выполнено'];

export function loadHobbies() {
  return JSON.parse(localStorage.getItem('safemy-hobbies-data') || JSON.stringify({
    'Дизайн': { xp: 240, level: 3, progress: 42, stages: [] },
    'Фотография': { xp: 0, level: 1, progress: 0, stages: [] }
  }));
}

export function saveHobbies(data) {
  localStorage.setItem('safemy-hobbies-data', JSON.stringify(data));
}

export function calculateLevel(xp) {
  return Math.max(1, Math.floor(xp / 100) + 1);
}

export function calculateProgress(stages) {
  if (!stages.length) return 0;
  return Math.round(stages.filter(stage => stage.status === 'Выполнено').length / stages.length * 100);
}
