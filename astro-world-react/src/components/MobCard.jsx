import { Link } from 'react-router-dom';

function MobCard({ mob }) {
  return (
    <article>
      {mob.iconId && (
        <img
          className="mob-icon"
          src={`/mob-icons/${mob.iconId}.png`}
          alt={`${mob.name} icon`}
        />
      )}

      <h3>
        <Link to={`/mobs/${mob.id}`}>{mob.name}</Link>
      </h3>

      <p>Type: {mob.type}</p>
      <p>Health: {mob.hp}</p>
    </article>
  );
}

export default MobCard;