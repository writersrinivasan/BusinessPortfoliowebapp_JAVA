const { db } = require('./db-setup');

const Habit = {
  getAll: () => {
    return new Promise((resolve, reject) => {
      db.all(`
        SELECT h.id, h.title, h.created_at,
          (
            SELECT COUNT(*) FROM habit_completions
            WHERE habit_id = h.id
          ) as total_completions,
          (
            SELECT COUNT(*) FROM habit_completions
            WHERE habit_id = h.id AND completed_date >= date('now', '-30 days')
          ) as month_completions,
          (
            SELECT CASE
              WHEN MAX(completed_date) = date('now') THEN 1
              ELSE 0
            END
            FROM habit_completions
            WHERE habit_id = h.id
          ) as completed_today
        FROM habits h
        ORDER BY h.created_at DESC
      `, [], (err, rows) => {
        if (err) {
          reject(err);
        } else {
          // Calculate streaks for each habit
          const promises = rows.map(habit => {
            return new Promise((resolve) => {
              db.all(
                `SELECT completed_date FROM habit_completions
                WHERE habit_id = ? ORDER BY completed_date DESC`,
                [habit.id],
                (err, completions) => {
                  if (err || !completions.length) {
                    habit.current_streak = 0;
                    return resolve(habit);
                  }
                  
                  let streak = 0;
                  const dates = completions.map(c => c.completed_date);
                  
                  // Check if today is completed
                  const today = new Date();
                  const todayStr = today.toISOString().split('T')[0];
                  
                  // If today isn't completed, we start checking from yesterday
                  let currentDate = new Date(today);
                  if (dates[0] !== todayStr) {
                    currentDate.setDate(currentDate.getDate() - 1);
                  }
                  
                  for (let i = 0; i < dates.length; i++) {
                    const dateToCheck = currentDate.toISOString().split('T')[0];
                    if (dates.includes(dateToCheck)) {
                      streak++;
                      currentDate.setDate(currentDate.getDate() - 1);
                    } else {
                      break;
                    }
                  }
                  
                  habit.current_streak = streak;
                  resolve(habit);
                }
              );
            });
          });
          
          Promise.all(promises).then(habitsWithStreaks => {
            resolve(habitsWithStreaks);
          });
        }
      });
    });
  },

  create: (habit) => {
    return new Promise((resolve, reject) => {
      db.run(
        'INSERT INTO habits (title) VALUES (?)',
        [habit.title],
        function(err) {
          if (err) {
            reject(err);
          } else {
            resolve({ id: this.lastID, ...habit });
          }
        }
      );
    });
  },

  toggleCompletion: (habitId, date) => {
    return new Promise((resolve, reject) => {
      // Check if there's already a completion record for this date
      db.get(
        'SELECT id FROM habit_completions WHERE habit_id = ? AND completed_date = ?',
        [habitId, date],
        (err, row) => {
          if (err) {
            reject(err);
            return;
          }
          
          if (row) {
            // If exists, delete it (toggle off)
            db.run(
              'DELETE FROM habit_completions WHERE id = ?',
              [row.id],
              function(err) {
                if (err) {
                  reject(err);
                } else {
                  resolve({ completed: false, date });
                }
              }
            );
          } else {
            // If doesn't exist, add it (toggle on)
            db.run(
              'INSERT INTO habit_completions (habit_id, completed_date) VALUES (?, ?)',
              [habitId, date],
              function(err) {
                if (err) {
                  reject(err);
                } else {
                  resolve({ completed: true, date });
                }
              }
            );
          }
        }
      );
    });
  },

  delete: (id) => {
    return new Promise((resolve, reject) => {
      db.run('DELETE FROM habits WHERE id = ?', [id], function(err) {
        if (err) {
          reject(err);
        } else {
          // Habit completions will cascade delete due to foreign key constraint
          resolve({ deleted: this.changes > 0 });
        }
      });
    });
  }
};

module.exports = Habit;
