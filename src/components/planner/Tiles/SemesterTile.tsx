import { UniqueIdentifier, useDroppable } from '@dnd-kit/core';
import React, { FC, forwardRef, useState, useRef } from 'react';

import { displaySemesterCode, getSemesterHourFromCourseCode } from '@/utils/utilFunctions';

import { DragDataToSemesterTile, GetDragIdByCourseAndSemester, Semester } from '../types';
import DraggableSemesterCourseItem from './SemesterCourseItem';
import ChevronIcon from '@/icons/ChevronIcon';
import SemesterTileDropdown from './SemesterTileDropdown';
import { useSemestersContext } from '../SemesterContext';
import LockIcon from '@/icons/LockIcon';
import UnlockedIcon from '@/icons/UnlockedIcon';
import { tagColors } from '../utils';
import CreditsWarnHoverCard from '../CreditsWarnHoverCard';

export interface SemesterTileProps {
  semester: Semester;
  getDragId: GetDragIdByCourseAndSemester;
}

/**
 * Strictly UI implementation of a semester tile
 */
/* eslint-disable react/prop-types */
export const MemoizedSemesterTile = React.memo(
  forwardRef<HTMLDivElement, SemesterTileProps>(function SemesterTile(
    { semester, getDragId },
    ref,
  ) {
    const [open, setOpen] = useState(true);
    const [hoverOpen, setHoverOpen] = useState(false);
    const hoverTimer = useRef<ReturnType<typeof setTimeout>>();

    const {
      handleSelectCourses,
      handleDeselectCourses,
      handleDeleteAllCoursesFromSemester,
      handleRemoveCourseFromSemester,
      courseIsSelected,
      handleSemesterColorChange,
      handleColorChange,
      handleCourseLock,
      handleSemesterLock,
      handleCoursePrereqOverride,
    } = useSemestersContext();

    const SemesterCredits = ({ taken }: { taken: number }) => {
      return (
        <div
          onMouseEnter={() => {
            hoverTimer.current = setTimeout(() => setHoverOpen(true), 500);
          }}
          onMouseLeave={() => {
            setHoverOpen(false);
            clearTimeout(hoverTimer.current);
          }}
        >
          <CreditsWarnHoverCard
            open={
              hoverOpen &&
              (taken > 19 ||
                (semester.code.semester == 'u' && taken > 15) ||
                (taken < 12 && taken != 0))
            }
            onOpenChange={(open) => setHoverOpen(open)}
            side="top"
          >
            <div
              className={`flex items-center gap-x-3 rounded-full px-3 py-2 ${
                taken > 19 ||
                (semester.code.semester == 'u' && taken > 15) ||
                (taken < 12 && taken != 0)
                  ? 'bg-yellow-100'
                  : 'bg-primary-100'
              }`}
            >
              <span
                className={`text-xs font-semibold ${
                  taken > 19 ||
                  (semester.code.semester == 'u' && taken > 15) ||
                  (taken < 12 && taken != 0)
                    ? 'text-yellow-500'
                    : 'text-primary-500'
                }`}
              >
                {taken} Credits Taken
              </span>
            </div>
          </CreditsWarnHoverCard>
        </div>
      );
    };

    // QUESTION: isValid color?
    return (
      <div
        ref={ref}
        className={`flex h-fit select-none flex-col gap-y-2 overflow-hidden rounded-2xl border border-neutral-300 ${
          semester.locked ? 'bg-neutral-200' : 'bg-white'
        }`}
      >
        <span className={`h-2 w-full transition-all ${tagColors[semester.color]}`}></span>
        <div className="flex flex-col gap-y-4 px-4 py-2">
          <article className="w-full">
            <div className={`flex h-3 flex-row items-center justify-center gap-2 align-middle`}>
              <ChevronIcon
                className={`${
                  open ? '-rotate-90' : 'rotate-90'
                } ml-auto h-3 w-3 transform cursor-pointer text-neutral-500 transition-all duration-500`}
                fontSize="inherit"
                onClick={() => setOpen(!open)}
              />
            </div>
          </article>
          <div
            className={`flex flex-row items-center justify-between ${
              semester.locked ? 'text-neutral-400' : 'text-primary-900'
            }`}
          >
            <div className={`flex h-10 flex-row items-center justify-center gap-2 align-middle`}>
              <h3 className={`text-2xl font-semibold tracking-tight`}>
                {displaySemesterCode(semester.code)}
              </h3>
              <button onClick={() => handleSemesterLock(semester.id.toString(), !semester.locked)}>
                {!semester.locked ? <UnlockedIcon /> : <LockIcon />}
              </button>
              <SemesterCredits
                taken={semester.courses.reduce(
                  (taken, current) => taken + (getSemesterHourFromCourseCode(current.code) ?? 3),
                  0,
                )}
              />
            </div>
            <SemesterTileDropdown
              locked={semester.locked}
              toggleLock={() => handleSemesterLock(semester.id.toString(), !semester.locked)}
              changeColor={(color) => handleSemesterColorChange(color, semester.id.toString())}
              deleteAllCourses={() => handleDeleteAllCoursesFromSemester(semester)}
              selectAllCourses={() =>
                handleSelectCourses(semester.courses.map((course) => course.id.toString()))
              }
            />
          </div>

          <article
            className={`mb-5 flex flex-col gap-y-4 overflow-hidden transition-all duration-700 ${
              open ? 'max-h-[999px]' : 'max-h-0'
            }`}
          >
            {semester.courses.map((course) => (
              <DraggableSemesterCourseItem
                onLockChange={(lock) => handleCourseLock(semester.id.toString(), lock, course.code)}
                onPrereqOverrideChange={(override) =>
                  handleCoursePrereqOverride(semester.id.toString(), override, course.code)
                }
                isSelected={courseIsSelected(course.id.toString())}
                onSelectCourse={() => handleSelectCourses([course.id.toString()])}
                onDeselectCourse={() => handleDeselectCourses([course.id.toString()])}
                onDeleteCourse={() => handleRemoveCourseFromSemester(semester, course)}
                onColorChange={(color) =>
                  handleColorChange(color, course.code, semester.id.toString())
                }
                key={course.id.toString()}
                dragId={getDragId(course, semester)}
                course={course}
                semester={semester}
              />
            ))}
            {semester.courses.length === 0 && (
              <div className="flex h-20 w-full items-center justify-center border-2 border-dotted opacity-80">
                Drag courses here
              </div>
            )}
          </article>
        </div>
      </div>
    );
  }),
);

export const SemesterTile = MemoizedSemesterTile;

export interface DroppableSemesterTileProps {
  dropId: UniqueIdentifier;
  semester: Semester;
  getSemesterCourseDragId: GetDragIdByCourseAndSemester;
}

/**
 * Strictly compositional wrapper around SemesterTile
 */
const DroppableSemesterTile: FC<DroppableSemesterTileProps> = ({
  dropId,
  semester,
  getSemesterCourseDragId,
  ...props
}) => {
  const { setNodeRef } = useDroppable({
    id: dropId,
    data: { to: 'semester-tile', semester } as DragDataToSemesterTile,
  });

  return (
    <SemesterTile
      ref={setNodeRef}
      semester={semester}
      getDragId={getSemesterCourseDragId}
      {...props}
    />
  );
};

export default React.memo(DroppableSemesterTile);
