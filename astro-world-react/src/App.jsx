import { useEffect, useState } from 'react';
import { Link, Route, Routes, useParams } from 'react-router-dom';
import MobCard from './components/MobCard';

function HomePage({ mobs, isLoading, error }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [sortBy, setSortBy] = useState('name');

  const types = ['All', ...new Set(mobs.map((mob) => mob.type))];

  const filteredMobs = mobs.filter((mob) => {
    const matchesSearch = mob.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    const matchesType = typeFilter === 'All' || mob.type === typeFilter;

    return matchesSearch && matchesType;
  });

  const displayedMobs = [...filteredMobs].sort((firstMob, secondMob) => {
    if (sortBy === 'health') {
      return firstMob.hp - secondMob.hp;
    }

    return firstMob.name.localeCompare(secondMob.name);
  });

  return (
    <>
      <header>
        <nav>
          <Link to="/">Astro World Mob Explorer</Link>
          <a href="#mobs">Browse Mobs</a>
        </nav>
      </header>

      <main>
        <section className="hero">
          <h1>Explore Minecraft Mobs</h1>
          <p>Search, filter, and learn about every mob in Astro World.</p>

          <input
            type="search"
            placeholder="Search mobs..."
            aria-label="Search mobs"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />

          <label>
            Filter by type:
            <select
              value={typeFilter}
              onChange={(event) => setTypeFilter(event.target.value)}
            >
              {types.map((type) => (
                <option key={type} value={type}>
                  {type === 'All' ? 'All types' : type}
                </option>
              ))}
            </select>
          </label>

          <label>
            Sort by:
            <select
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value)}
            >
              <option value="name">Name</option>
              <option value="health">Health</option>
            </select>
          </label>
        </section>

        <section id="mobs">
          <h2>Mob Catalog</h2>

          {isLoading ? (
            <p>Loading mobs...</p>
          ) : error ? (
            <p>{error}</p>
          ) : displayedMobs.length > 0 ? (
            <div>
              {displayedMobs.map((mob) => (
                <MobCard key={mob.id} mob={mob} />
              ))}
            </div>
          ) : (
            <p>No mobs found.</p>
          )}
        </section>
      </main>

      <footer>
        <p>Astro World Mob Explorer</p>
      </footer>
    </>
  );
}

function MobDetailsPage({ mobs, isLoading, error }) {
  const { mobId } = useParams();

  if (isLoading) {
    return (
      <main>
        <p>Loading mob details...</p>
      </main>
    );
  }

  if (error) {
    return (
      <main>
        <p>{error}</p>
      </main>
    );
  }

  const mob = mobs.find((item) => item.id === mobId);

  if (!mob) {
    return (
      <main>
        <h1>Mob not found</h1>
        <Link to="/">Return to the mob list</Link>
      </main>
    );
  }

  return (
    <>
      <header>
        <nav>
          <Link to="/">Astro World Mob Explorer</Link>
          <Link to="/">Browse Mobs</Link>
        </nav>
      </header>

      <main>
        <Link to="/">← Back to all mobs</Link>

        <section>
          {mob.iconId && (
            <img
              className="mob-icon"
              src={`/mob-icons/${mob.iconId}.png`}
              alt={`${mob.name} icon`}
            />
          )}

          <h1>{mob.name}</h1>
          <p>{mob.behavior}</p>
          <p>Type: {mob.type}</p>
          <p>Health: {mob.hp}</p>

          <h2>Spawn biomes</h2>
          <p>{mob.spawnBiomes?.join(', ') || 'No biome data available.'}</p>

          <h2>Drops</h2>
          {mob.drops?.length > 0 ? (
            <ul>
              {mob.drops.map((drop) => (
                <li key={drop.item}>
                  {drop.item}: {drop.count.min}–{drop.count.max}
                </li>
              ))}
            </ul>
          ) : (
            <p>No drop data available.</p>
          )}
        </section>
      </main>

      <footer>
        <p>Astro World Mob Explorer</p>
      </footer>
    </>
  );
}

function App() {
  const [mobs, setMobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

useEffect(() => {
  async function loadData() {
    try {
      const [mobsResponse, entitiesResponse] = await Promise.all([
        fetch('https://api.astroworldmc.com/v1/mobs'),
        fetch(`${import.meta.env.BASE_URL}entities.json`),
      ]);

      if (!mobsResponse.ok || !entitiesResponse.ok) {
        throw new Error('Could not load mob data.');
      }

      const [mobResult, entities] = await Promise.all([
        mobsResponse.json(),
        entitiesResponse.json(),
      ]);

      const iconIds = new Map(
        entities.map((entity) => [entity.text_type, entity.type])
      );

      const mobsWithIcons = mobResult.data.map((mob) => ({
        ...mob,
        iconId: iconIds.get(mob.id),
      }));

      setMobs(mobsWithIcons);
    } catch {
      setError('Unable to load mob data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }

  loadData();
}, []);
 
  return (
    <Routes>
      <Route
        path="/"
        element={<HomePage mobs={mobs} isLoading={isLoading} error={error} />}
      />
      <Route
        path="/mobs/:mobId"
        element={
          <MobDetailsPage
            mobs={mobs}
            isLoading={isLoading}
            error={error}
          />
        }
      />
    </Routes>
  );
}

export default App;